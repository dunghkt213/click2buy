import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as crypto from 'crypto';

export type ContentType = 'REVIEW' | 'CHAT';
export type ImageType = 'PRODUCT_IMAGE' | 'REVIEW_IMAGE';

/**
 * Cache entry cho image search query
 */
interface ImageSearchCache {
  query: string;
  keywords: string[];
  cachedAt: number; // timestamp ms
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  
  // Cache cho image -> query (image hash -> extracted data)
  private readonly imageSearchCache = new Map<string, ImageSearchCache>();
  
  // Cache TTL - 1 giờ (configurable)
  private readonly cacheMaxAge = 60 * 60 * 1000; // 1h in ms

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY không được cấu hình. AI Guard sẽ bị vô hiệu hóa.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Validate nội dung bằng AI
   * @param content - Nội dung cần kiểm tra
   * @param type - Loại nội dung: 'REVIEW' hoặc 'CHAT'
   * @returns true nếu nội dung an toàn, false nếu vi phạm
   */
  async validateContent(content: string, type: ContentType): Promise<boolean> {
    // Nếu không có API key, cho qua mặc định
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('AI Guard bị vô hiệu hóa do thiếu API key');
      return true;
    }

    // Nếu nội dung rỗng hoặc quá ngắn, cho qua
    if (!content || content.trim().length < 3) {
      return true;
    }

    try {
      const prompt = this.buildPrompt(content, type);
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim().toUpperCase();

      this.logger.debug(`AI Response for ${type}: ${response}`);

      // AI trả về "SAFE" nếu an toàn, "VIOLATION" nếu vi phạm
      if (response.includes('VIOLATION')) {
        this.logger.warn(`Nội dung vi phạm được phát hiện: "${content.substring(0, 50)}..."`);
        return false;
      }

      return true;
    } catch (error) {
      // Nếu AI không phản hồi hoặc lỗi, cho qua để không chặn user oan
      this.logger.error(`AI validation error: ${error.message}`);
      return true;
    }
  }

  /**
   * Tóm tắt danh sách review cho sản phẩm
   * @param reviews - Mảng nội dung review
   * @returns Bản tóm tắt 2-3 câu bằng tiếng Việt
   */
  async summarizeReviews(reviews: string[]): Promise<string | null> {
    // Nếu không có API key, bỏ qua
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Summary] Bỏ qua do thiếu GEMINI_API_KEY');
      return null;
    }

    // Nếu không có review nào, bỏ qua
    if (!reviews || reviews.length === 0) {
      this.logger.debug('[AI Summary] Không có review để tóm tắt');
      return null;
    }

    try {
      const reviewsText = reviews
        .map((r, i) => `${i + 1}. ${r}`)
        .join('\n');

      const prompt = `Bạn là trợ lý AI cho website thương mại điện tử.
Nhiệm vụ: Tóm tắt các đánh giá sản phẩm dưới đây thành 2-3 câu ngắn gọn.

Các đánh giá:
"""
${reviewsText}
"""

Yêu cầu:
- Ngôn ngữ: Tiếng Việt
- Văn phong: Trung lập, súc tích, dễ hiểu
- Độ dài: 2-3 câu
- Tập trung vào điểm nổi bật (ưu điểm, nhược điểm chính)
- Không thêm thông tin không có trong review

Chỉ trả về bản tóm tắt, không giải thích thêm.`;

      const result = await this.model.generateContent(prompt);
      const summary = result.response.text().trim();

      this.logger.log(`[AI Summary] Tạo tóm tắt thành công: "${summary.substring(0, 50)}..."`);
      return summary;
    } catch (error) {
      // Fail-safe: không throw error, chỉ log warning
      this.logger.warn(`[AI Summary] Lỗi khi tạo tóm tắt: ${error.message}`);
      return null;
    }
  }

  /**
   * Trích xuất query text từ ảnh sản phẩm để search (với cache)
   * @param image - URL ảnh hoặc Base64 string
   * @returns { query: string, keywords: string[] } hoặc null nếu lỗi
   */
  async extractQueryFromImage(image: string): Promise<{ query: string; keywords: string[] } | null> {
    // Fail-safe: Nếu không có API key, return null
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Image Search] Bỏ qua do thiếu GEMINI_API_KEY');
      return null;
    }

    // Nếu không có ảnh, return null
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      this.logger.warn('[AI Image Search] Ảnh trống');
      return null;
    }

    try {
      // 1. Tạo hash của ảnh để làm cache key
      const imageHash = this.hashImage(image);
      const now = Date.now();

      // 2. Check cache
      const cached = this.imageSearchCache.get(imageHash);
      if (cached) {
        const age = now - cached.cachedAt;
        if (age < this.cacheMaxAge) {
          const ageMin = Math.floor(age / 60000);
          this.logger.log(
            `[AI Image Search] CACHE HIT (age: ${ageMin}m) - query="${cached.query.substring(0, 50)}..."`
          );
          return {
            query: cached.query,
            keywords: cached.keywords,
          };
        } else {
          // Cache expired, xóa
          this.imageSearchCache.delete(imageHash);
          this.logger.debug('[AI Image Search] Cache expired, xóa và gọi AI lại');
        }
      }

      // 3. Cache MISS - gọi AI
      this.logger.log('[AI Image Search] CACHE MISS - gọi Gemini...');
      
      const prompt = `Bạn là trợ lý AI cho website thương mại điện tử.
Nhiệm vụ: Phân tích ảnh sản phẩm và trích xuất thông tin để tìm kiếm.

Yêu cầu:
- Xác định loại sản phẩm, thương hiệu (nếu có), màu sắc, đặc điểm nổi bật
- Trả về JSON STRICT theo format:
{
  "query": "mô tả ngắn gọn sản phẩm (12-20 từ, tiếng Việt)",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"]
}

Ví dụ:
- Ảnh iPhone 13 đỏ → {"query": "điện thoại iPhone 13 màu đỏ smartphone", "keywords": ["iphone", "điện thoại", "đỏ"]}
- Ảnh áo thun trắng → {"query": "áo thun nam nữ màu trắng cotton", "keywords": ["áo thun", "trắng", "cotton"]}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.`;

      const imagePart = await this.prepareImagePart(image);

      if (!imagePart) {
        this.logger.warn('[AI Image Search] Không thể xử lý ảnh');
        return null;
      }

      const result = await this.model.generateContent([prompt, imagePart]);
      const responseText = result.response.text().trim();

      // Parse JSON response
      // Remove markdown code blocks nếu có
      let jsonText = responseText;
      if (responseText.includes('```json')) {
        const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) jsonText = match[1];
      } else if (responseText.includes('```')) {
        const match = responseText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) jsonText = match[1];
      }

      const parsed = JSON.parse(jsonText);

      if (!parsed.query || typeof parsed.query !== 'string') {
        this.logger.warn('[AI Image Search] AI trả về query không hợp lệ');
        return null;
      }

      this.logger.log(`[AI Image Search] Trích xuất thành công: query="${parsed.query.substring(0, 50)}...", keywords=${JSON.stringify(parsed.keywords || [])}`);
      
      const result_data = {
        query: parsed.query,
        keywords: parsed.keywords || [],
      };

      // 4. Lưu vào cache
      this.imageSearchCache.set(imageHash, {
        ...result_data,
        cachedAt: now,
      });
      this.logger.debug(`[AI Image Search] Đã cache kết quả (hash: ${imageHash.substring(0, 12)}...)`);

      // 5. Clean old cache (giữ max 100 entries)
      if (this.imageSearchCache.size > 100) {
        const firstKey = this.imageSearchCache.keys().next().value;
        this.imageSearchCache.delete(firstKey);
      }
      
      return result_data;
    } catch (error) {
      // Fail-safe: không throw error, chỉ log warning
      this.logger.warn(`[AI Image Search] Lỗi khi trích xuất query: ${error.message}`);
      return null;
    }
  }

  /**
   * Tạo hash SHA256 của ảnh (URL hoặc base64)
   * @param image - URL hoặc base64 string
   * @returns hash string
   */
  private hashImage(image: string): string {
    return crypto.createHash('sha256').update(image).digest('hex');
  }

  /**
   * Kiểm duyệt ảnh bằng AI (Gemini multimodal)
   * @param image - URL ảnh hoặc Base64 string
   * @param type - Loại ảnh: 'PRODUCT_IMAGE' hoặc 'REVIEW_IMAGE'
   * @returns true nếu ảnh an toàn, false nếu vi phạm
   */
  async validateImage(image: string, type: ImageType): Promise<boolean> {
    // Fail-safe: Nếu không có API key, cho qua
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Image] Bỏ qua kiểm duyệt do thiếu GEMINI_API_KEY');
      return true;
    }

    // Nếu không có ảnh, cho qua
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      return true;
    }

    try {
      const prompt = this.buildImagePrompt(type);
      const imagePart = await this.prepareImagePart(image);

      if (!imagePart) {
        this.logger.warn('[AI Image] Không thể xử lý ảnh, cho qua');
        return true;
      }

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response.text().trim().toUpperCase();

      this.logger.debug(`[AI Image] Response for ${type}: ${response}`);

      if (response.includes('VIOLATION')) {
        this.logger.warn(`[AI Image] Ảnh vi phạm được phát hiện (${type})`);
        return false;
      }

      this.logger.log(`[AI Image] Ảnh hợp lệ (${type})`);
      return true;
    } catch (error) {
      // Fail-safe: Nếu AI lỗi/timeout, cho qua để không chặn user oan
      this.logger.warn(`[AI Image] Lỗi kiểm duyệt ảnh: ${error.message}`);
      return true;
    }
  }

  /**
   * Kiểm duyệt nhiều ảnh cùng lúc
   * @param images - Mảng URL ảnh hoặc Base64 strings
   * @param type - Loại ảnh
   * @returns { valid: boolean, violatedIndex?: number } - valid=false nếu có ảnh vi phạm
   */
  async validateImages(images: string[], type: ImageType): Promise<{ valid: boolean; violatedIndex?: number }> {
    if (!images || images.length === 0) {
      return { valid: true };
    }

    for (let i = 0; i < images.length; i++) {
      const isValid = await this.validateImage(images[i], type);
      if (!isValid) {
        return { valid: false, violatedIndex: i };
      }
    }

    return { valid: true };
  }

  /**
   * Chuẩn bị image part cho Gemini multimodal
   */
  private async prepareImagePart(image: string): Promise<any | null> {
    try {
      // Nếu là Base64
      if (image.startsWith('data:image/')) {
        const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          return {
            inlineData: {
              mimeType: `image/${matches[1]}`,
              data: matches[2],
            },
          };
        }
      }

      // Nếu là Base64 không có prefix
      if (this.isBase64(image)) {
        return {
          inlineData: {
            mimeType: 'image/jpeg', // Default mime type
            data: image,
          },
        };
      }

      // Nếu là URL, fetch và convert sang base64
      if (image.startsWith('http://') || image.startsWith('https://')) {
        const response = await fetch(image);
        if (!response.ok) {
          this.logger.warn(`[AI Image] Không thể fetch ảnh từ URL: ${image}`);
          return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return {
          inlineData: {
            mimeType: contentType,
            data: base64,
          },
        };
      }

      this.logger.warn(`[AI Image] Định dạng ảnh không hỗ trợ: ${image.substring(0, 50)}...`);
      return null;
    } catch (error) {
      this.logger.warn(`[AI Image] Lỗi chuẩn bị ảnh: ${error.message}`);
      return null;
    }
  }

  /**
   * Kiểm tra string có phải Base64 không
   */
  private isBase64(str: string): boolean {
    try {
      return Buffer.from(str, 'base64').toString('base64') === str;
    } catch {
      return false;
    }
  }

  /**
   * Xây dựng prompt kiểm duyệt ảnh
   */
  private buildImagePrompt(type: ImageType): string {
    const context = type === 'PRODUCT_IMAGE' 
      ? 'ảnh sản phẩm do người bán đăng tải'
      : 'ảnh đánh giá sản phẩm do người mua đăng tải';

    return `Bạn là hệ thống kiểm duyệt hình ảnh cho sàn thương mại điện tử.
Nhiệm vụ: Phân tích ${context} và xác định xem nó có vi phạm chính sách không.

Tiêu chí VI PHẠM (chặn ngay):
1. KHIÊU DÂM: Ảnh khỏa thân, bán khỏa thân, nội dung người lớn, gợi dục
2. BẠO LỰC: Máu me, thương tích, hành vi bạo lực, tra tấn
3. MA TÚY: Chất cấm, thuốc phiện, cần sa, kim tiêm sử dụng ma túy
4. VŨ KHÍ: Súng, dao, vũ khí nguy hiểm (trừ dao nhà bếp, dụng cụ hợp pháp)
5. NỘI DUNG ĐỘC HẠI: Biểu tượng thù địch, phân biệt chủng tộc, khủng bố
6. TRÁI PHÁP LUẬT: Hàng giả, hàng cấm, nội dung vi phạm pháp luật Việt Nam

KHÔNG VI PHẠM (cho phép):
- Ảnh sản phẩm bình thường (quần áo, điện tử, thực phẩm, đồ gia dụng...)
- Ảnh người mặc quần áo bình thường
- Ảnh đồ dùng hợp pháp (dao nhà bếp, dụng cụ thể thao...)
- Ảnh thực phẩm, đồ uống hợp pháp

Chỉ trả lời một từ duy nhất:
- "SAFE" nếu ảnh an toàn và hợp lệ
- "VIOLATION" nếu ảnh vi phạm bất kỳ tiêu chí nào ở trên`;
  }

  /**
   * So sánh độ tương đồng giữa sản phẩm mới và NHIỀU sản phẩm cũ bằng 1 AI request duy nhất
   * @param newProductText - Text sản phẩm mới đã chuẩn hóa
   * @param oldProducts - Danh sách sản phẩm cũ { productId, text }
   * @returns { maxSimilarity: number, productId?: string } hoặc null nếu lỗi
   */
  async compareSimilarityBatch(
    newProductText: string,
    oldProducts: { productId: string; text: string }[]
  ): Promise<{ maxSimilarity: number; productId?: string } | null> {
    // Fail-safe: Nếu không có API key, trả về null (cho phép)
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Batch Similarity] Bỏ qua do thiếu GEMINI_API_KEY');
      return null;
    }

    // Nếu không có sản phẩm cũ hoặc text mới quá ngắn
    if (!oldProducts || oldProducts.length === 0 || newProductText.length < 30) {
      this.logger.debug('[AI Batch Similarity] Không có dữ liệu để so sánh');
      return null;
    }

    try {
      // Tạo danh sách sản phẩm cũ cho prompt
      const oldProductsList = oldProducts
        .map((p, index) => `${index + 1}. ID: ${p.productId}\nNội dung: ${p.text}`)
        .join('\n\n');

      const prompt = `Bạn là hệ thống phát hiện nội dung trùng lặp cho sàn thương mại điện tử.
Nhiệm vụ: So sánh SẢN PHẨM MỚI với TẤT CẢ các sản phẩm cũ dưới đây và tìm độ tương đồng CAO NHẤT.

SẢN PHẨM MỚI:
"""
${newProductText}
"""

DANH SÁCH SẢN PHẨM CŨ:
${oldProductsList}

Tiêu chí đánh giá độ tương đồng:
- 0-30: Hoàn toàn khác nhau (sản phẩm khác loại, mô tả khác biệt)
- 31-50: Có điểm tương đồng nhỏ (cùng danh mục nhưng khác sản phẩm)
- 51-70: Tương đồng trung bình (cùng loại sản phẩm, mô tả có phần giống)
- 71-85: Tương đồng cao (mô tả gần giống, có thể copy và sửa nhẹ)
- 86-100: Gần như trùng lặp hoàn toàn (copy nguyên văn hoặc paraphrase)

CHỈ TRẢ VỀ JSON THEO FORMAT SAU (không giải thích, không text thừa):
{
  "maxSimilarity": <số nguyên 0-100>,
  "productId": "<ID của sản phẩm cũ tương đồng nhất, hoặc null nếu maxSimilarity < 80>"
}

Ví dụ:
{"maxSimilarity": 87, "productId": "64fa123..."}
hoặc
{"maxSimilarity": 45, "productId": null}`;

      this.logger.log(`[AI Batch Similarity] Gửi 1 request so sánh với ${oldProducts.length} sản phẩm cũ`);

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      this.logger.debug(`[AI Batch Similarity] Raw response: ${response}`);

      // Parse JSON response
      const parsed = this.parseJsonResponse(response);
      if (!parsed) {
        this.logger.warn('[AI Batch Similarity] Không parse được JSON response');
        return null;
      }

      const { maxSimilarity, productId } = parsed;

      // Validate maxSimilarity
      if (typeof maxSimilarity !== 'number' || maxSimilarity < 0 || maxSimilarity > 100) {
        this.logger.warn(`[AI Batch Similarity] maxSimilarity không hợp lệ: ${maxSimilarity}`);
        return null;
      }

      this.logger.log(`[AI Batch Similarity] Kết quả: maxSimilarity=${maxSimilarity}%, productId=${productId}`);

      return {
        maxSimilarity,
        productId: productId || undefined,
      };
    } catch (error) {
      // Fail-safe: Nếu AI lỗi/timeout, trả về null (cho phép)
      this.logger.warn(`[AI Batch Similarity] Lỗi: ${error.message}`);
      return null;
    }
  }

  /**
   * So sánh độ tương đồng ảnh giữa sản phẩm mới và NHIỀU sản phẩm cũ bằng 1 AI request multimodal
   * @param newProductImages - Mảng ảnh sản phẩm mới (tối đa 2 ảnh đầu tiên)
   * @param oldProductImages - Danh sách { productId, image } của sản phẩm cũ (1 ảnh đại diện mỗi sản phẩm)
   * @returns { maxSimilarity: number, productId?: string, reason: string } hoặc null nếu lỗi
   */
  async compareImageSimilarityBatch(
    newProductImages: string[],
    oldProductImages: { productId: string; image: string }[]
  ): Promise<{ maxSimilarity: number; productId?: string; reason: string } | null> {
    // Fail-safe: Nếu không có API key, trả về null (cho phép)
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Image Batch Similarity] Bỏ qua do thiếu GEMINI_API_KEY');
      return null;
    }

    // Nếu không có ảnh để so sánh
    if (!newProductImages?.length || !oldProductImages?.length) {
      this.logger.debug('[AI Image Batch Similarity] Không có ảnh để so sánh');
      return null;
    }

    try {
      // Chuẩn bị ảnh mới (tối đa 2 ảnh)
      const newImages = newProductImages.slice(0, 2);
      const newImageParts: any[] = [];
      
      for (let i = 0; i < newImages.length; i++) {
        const imagePart = await this.prepareImagePart(newImages[i]);
        if (imagePart) {
          newImageParts.push(imagePart);
        }
      }

      if (newImageParts.length === 0) {
        this.logger.warn('[AI Image Batch Similarity] Không thể xử lý ảnh mới');
        return null;
      }

      // Chuẩn bị ảnh cũ (1 ảnh đại diện mỗi sản phẩm)
      const oldImageParts: any[] = [];
      const validOldProducts: { productId: string; image: string }[] = [];

      for (const oldProduct of oldProductImages) {
        const imagePart = await this.prepareImagePart(oldProduct.image);
        if (imagePart) {
          oldImageParts.push(imagePart);
          validOldProducts.push(oldProduct);
        }
      }

      if (oldImageParts.length === 0) {
        this.logger.debug('[AI Image Batch Similarity] Không có ảnh cũ hợp lệ để so sánh');
        return null;
      }

      // Tạo prompt multimodal
      const prompt = `Bạn là hệ thống phát hiện ảnh trùng lặp cho sàn thương mại điện tử.
Nhiệm vụ: So sánh ảnh SẢN PHẨM MỚI với TẤT CẢ ảnh sản phẩm cũ và tìm độ tương đồng CAO NHẤT.

CÁCH THỨC:
- ${newImageParts.length} ảnh đầu tiên là ảnh SẢN PHẨM MỚI
- ${oldImageParts.length} ảnh tiếp theo là ảnh các sản phẩm cũ (theo thứ tự): ${validOldProducts.map((p, i) => `${i + 1}. ${p.productId}`).join(', ')}

Tiêu chí đánh giá độ tương đồng ảnh:
- 0-30: Hoàn toàn khác nhau (sản phẩm khác loại, góc chụp khác, màu sắc khác)
- 31-50: Có điểm tương đồng nhỏ (cùng danh mục nhưng khác sản phẩm)
- 51-70: Tương đồng trung bình (cùng loại sản phẩm, có điểm giống nhau)
- 71-85: Tương đồng cao (sản phẩm giống, góc chụp/ánh sáng khác)
- 86-100: Gần như trùng lặp hoàn toàn (cùng sản phẩm, có thể chỉnh sửa nhẹ)

CHỈ TRẢ VỀ JSON THEO FORMAT SAU (không giải thích, không text thừa):
{
  "maxSimilarity": <số nguyên 0-100>,
  "productId": "<ID của sản phẩm cũ tương đồng nhất, hoặc null nếu maxSimilarity < 70>",
  "reason": "IMAGE_DUPLICATE" hoặc "NOT_DUPLICATE"
}

Ví dụ:
{"maxSimilarity": 85, "productId": "64fa123...", "reason": "IMAGE_DUPLICATE"}
hoặc
{"maxSimilarity": 45, "productId": null, "reason": "NOT_DUPLICATE"}`;

      // Tạo content array với prompt + tất cả ảnh
      const content = [prompt, ...newImageParts, ...oldImageParts];

      this.logger.log(`[AI Image Batch Similarity] Gửi 1 multimodal request: ${newImageParts.length} ảnh mới + ${oldImageParts.length} ảnh cũ`);

      const result = await this.model.generateContent(content);
      const response = result.response.text().trim();

      this.logger.debug(`[AI Image Batch Similarity] Raw response: ${response}`);

      // Parse JSON response
      const parsed = this.parseImageSimilarityResponse(response);
      if (!parsed) {
        this.logger.warn('[AI Image Batch Similarity] Không parse được JSON response');
        return null;
      }

      const { maxSimilarity, productId, reason } = parsed;

      // Validate maxSimilarity
      if (typeof maxSimilarity !== 'number' || maxSimilarity < 0 || maxSimilarity > 100) {
        this.logger.warn(`[AI Image Batch Similarity] maxSimilarity không hợp lệ: ${maxSimilarity}`);
        return null;
      }

      this.logger.log(`[AI Image Batch Similarity] Kết quả: maxSimilarity=${maxSimilarity}%, productId=${productId}, reason=${reason}`);

      return {
        maxSimilarity,
        productId: productId || undefined,
        reason: reason || 'NOT_DUPLICATE',
      };
    } catch (error) {
      // Fail-safe: Nếu AI lỗi/timeout, trả về null (cho phép)
      this.logger.warn(`[AI Image Batch Similarity] Lỗi: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse JSON response từ AI image similarity một cách an toàn
   */
  private parseImageSimilarityResponse(response: string): { maxSimilarity: number; productId: string | null; reason: string } | null {
    try {
      // Tìm JSON object trong response
      const jsonMatch = response.match(/\{[^}]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        maxSimilarity: parsed.maxSimilarity,
        productId: parsed.productId,
        reason: parsed.reason || 'NOT_DUPLICATE',
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse JSON response từ AI một cách an toàn
   */
  private parseJsonResponse(response: string): { maxSimilarity: number; productId: string | null } | null {
    try {
      // Tìm JSON object trong response
      const jsonMatch = response.match(/\{[^}]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        maxSimilarity: parsed.maxSimilarity,
        productId: parsed.productId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Chuẩn hóa text để so sánh
   */
  normalizeTextForComparison(product: any): string {
    const parts: string[] = [];

    if (product.name) parts.push(product.name);
    if (product.description) parts.push(product.description);
    if (product.category) parts.push(product.category);
    if (product.brand) parts.push(product.brand);
    
    if (product.specifications) {
      try {
        const specs = typeof product.specifications === 'string' 
          ? product.specifications 
          : JSON.stringify(product.specifications);
        parts.push(specs);
      } catch {}
    }
    
    if (Array.isArray(product.tags)) {
      parts.push(product.tags.join(' '));
    }

    // Chuẩn hóa: trim, lowercase, collapse whitespace
    return parts
      .join(' ')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Xây dựng prompt dựa trên loại nội dung
   */
  private buildPrompt(content: string, type: ContentType): string {
    if (type === 'REVIEW') {
      return `Bạn là hệ thống kiểm duyệt nội dung cho website thương mại điện tử.
Nhiệm vụ: Phân tích đánh giá sản phẩm sau và xác định xem nó có vi phạm tiêu chuẩn cộng đồng không.

Nội dung đánh giá:
"""
${content}
"""

Tiêu chí vi phạm:
1. SPAM: Nội dung lặp lại vô nghĩa, ký tự ngẫu nhiên, hoặc không liên quan đến sản phẩm
2. QUẢNG CÁO: Chứa link, số điện thoại, hoặc quảng cáo sản phẩm/dịch vụ khác
3. XÚC PHẠM: Ngôn ngữ thô tục, chửi bới, phân biệt đối xử, đe dọa
4. NỘI DUNG ĐỘC HẠI: Thông tin sai lệch nguy hiểm, kích động bạo lực

Chỉ trả lời một từ duy nhất:
- "SAFE" nếu nội dung an toàn và hợp lệ
- "VIOLATION" nếu nội dung vi phạm bất kỳ tiêu chí nào ở trên`;
    }

    // Type === 'CHAT'
    return `Bạn là hệ thống kiểm duyệt tin nhắn chat cho sàn thương mại điện tử.
Nhiệm vụ: Phân tích tin nhắn và xác định xem nó có vi phạm chính sách không.

Tin nhắn:
"""
${content}
"""

Tiêu chí VI PHẠM (chỉ chặn những trường hợp này):
1. LỪA ĐẢO (SCAM): Yêu cầu cung cấp thông tin cá nhân nhạy cảm, mật khẩu, OTP, hoặc có dấu hiệu lừa đảo
2. GẠ GẪM CHUYỂN KHOẢN NGOÀI: Yêu cầu thanh toán ngoài hệ thống, chuyển tiền trực tiếp qua tài khoản cá nhân để tránh phí
3. TỪ NGỮ THÔ TỤC: Chửi bới, xúc phạm, ngôn ngữ tục tĩu, quấy rối tình dục

KHÔNG VI PHẠM (cho phép):
- Chào hỏi thông thường (xin chào, hi, hello, alo...)
- Hỏi đáp về sản phẩm, giá cả, vận chuyển
- Thương lượng giá trong hệ thống
- Tin nhắn giao tiếp bình thường giữa người mua và người bán

Chỉ trả lời một từ duy nhất:
- "SAFE" nếu tin nhắn an toàn hoặc là giao tiếp bình thường
- "VIOLATION" nếu tin nhắn vi phạm một trong các tiêu chí trên`;
  }
}
