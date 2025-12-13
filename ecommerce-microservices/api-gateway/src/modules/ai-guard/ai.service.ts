import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type ContentType = 'REVIEW' | 'CHAT';

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
