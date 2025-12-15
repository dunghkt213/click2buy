import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type ContentType = 'REVIEW' | 'CHAT';
export type ImageType = 'PRODUCT_IMAGE' | 'REVIEW_IMAGE';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

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
   * So sánh độ tương đồng giữa 2 đoạn text bằng AI (DEPRECATED - dùng compareSimilarityBatch thay thế)
   * @param textA - Đoạn text thứ nhất
   * @param textB - Đoạn text thứ hai
   * @returns Số nguyên 0-100 (% tương đồng), null nếu lỗi
   */
  async compareSimilarity(textA: string, textB: string): Promise<number | null> {
    // Fail-safe: Nếu không có API key, trả về null (cho phép)
    if (!this.configService.get<string>('GEMINI_API_KEY')) {
      this.logger.warn('[AI Similarity] Bỏ qua do thiếu GEMINI_API_KEY');
      return null;
    }

    // Nếu text rỗng hoặc quá ngắn, trả về null
    if (!textA || !textB || textA.trim().length < 30 || textB.trim().length < 30) {
      this.logger.debug('[AI Similarity] Text quá ngắn, bỏ qua kiểm tra');
      return null;
    }

    try {
      const prompt = `Bạn là hệ thống phát hiện nội dung trùng lặp cho sàn thương mại điện tử.
Nhiệm vụ: So sánh độ tương đồng về NỘI DUNG và Ý NGHĨA giữa 2 mô tả sản phẩm dưới đây.

MÔ TẢ SẢN PHẨM A:
"""
${textA}
"""

MÔ TẢ SẢN PHẨM B:
"""
${textB}
"""

Tiêu chí đánh giá:
- 0-30: Hoàn toàn khác nhau (sản phẩm khác loại, mô tả khác biệt)
- 31-50: Có điểm tương đồng nhỏ (cùng danh mục nhưng khác sản phẩm)
- 51-70: Tương đồng trung bình (cùng loại sản phẩm, mô tả có phần giống)
- 71-85: Tương đồng cao (mô tả gần giống, có thể copy và sửa nhẹ)
- 86-100: Gần như trùng lặp hoàn toàn (copy nguyên văn hoặc paraphrase)

CHỈ TRẢ VỀ MỘT SỐ NGUYÊN TỪ 0 ĐẾN 100.
Không thêm ký hiệu %, không giải thích, không thêm chữ.
Ví dụ: 75`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      // Parse số từ response
      const match = response.match(/\b([0-9]{1,3})\b/);
      if (!match) {
        this.logger.warn(`[AI Similarity] Không parse được số từ response: "${response}"`);
        return null;
      }

      const similarity = parseInt(match[1], 10);
      if (similarity < 0 || similarity > 100) {
        this.logger.warn(`[AI Similarity] Số ngoài phạm vi 0-100: ${similarity}`);
        return null;
      }

      this.logger.debug(`[AI Similarity] Độ tương đồng: ${similarity}%`);
      return similarity;
    } catch (error) {
      // Fail-safe: Nếu AI lỗi/timeout, trả về null (cho phép)
      this.logger.warn(`[AI Similarity] Lỗi: ${error.message}`);
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
