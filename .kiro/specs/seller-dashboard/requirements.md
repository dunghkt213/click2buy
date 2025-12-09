# Tài liệu Yêu cầu - Seller Dashboard Backend

## Giới thiệu

Seller Dashboard là hệ thống backend cho phép người bán hàng quản lý sản phẩm, theo dõi đơn hàng, và quản lý tồn kho trên nền tảng Click2Buy. Hệ thống được xây dựng theo kiến trúc microservices với Node.js, NestJS, MongoDB Atlas, và giao tiếp qua Kafka pub/sub.

## Bảng thuật ngữ

- **Seller**: Người bán hàng trên nền tảng Click2Buy, có quyền quản lý sản phẩm và đơn hàng của mình
- **Product Service**: Microservice quản lý thông tin sản phẩm
- **Order Service**: Microservice quản lý đơn hàng
- **Inventory Service**: Microservice quản lý tồn kho sản phẩm
- **API Gateway**: Điểm vào duy nhất cho tất cả các request từ client
- **Kafka**: Hệ thống message broker cho pub/sub pattern
- **sellerId**: Định danh duy nhất của người bán trong hệ thống
- **ownerId**: Trường trong database định danh chủ sở hữu của sản phẩm hoặc đơn hàng

## Yêu cầu

### Yêu cầu 1: Quản lý sản phẩm của Seller

**User Story:** Là một người bán, tôi muốn quản lý sản phẩm của mình (tạo, xem, sửa, xóa) để có thể kinh doanh trên nền tảng

#### Tiêu chí chấp nhận

1. WHEN người bán gửi request tạo sản phẩm mới với thông tin hợp lệ, THE Product Service SHALL tạo sản phẩm với trường ownerId là sellerId của người bán
2. WHEN người bán gửi request xem danh sách sản phẩm, THE Product Service SHALL trả về chỉ những sản phẩm có ownerId khớp với sellerId của người bán
3. WHEN người bán gửi request cập nhật sản phẩm, THE Product Service SHALL kiểm tra ownerId khớp với sellerId trước khi cho phép cập nhật
4. WHEN người bán gửi request xóa sản phẩm, THE Product Service SHALL kiểm tra ownerId khớp với sellerId và stock bằng 0 trước khi cho phép xóa
5. IF người bán cố gắng truy cập sản phẩm không thuộc sở hữu, THEN THE Product Service SHALL trả về lỗi 403 Forbidden

### Yêu cầu 2: Quản lý đơn hàng của Seller

**User Story:** Là một người bán, tôi muốn xem và xử lý các đơn hàng liên quan đến sản phẩm của mình để hoàn thành giao dịch

#### Tiêu chí chấp nhận

1. WHEN người bán gửi request xem danh sách đơn hàng, THE Order Service SHALL trả về chỉ những đơn hàng chứa sản phẩm có ownerId khớp với sellerId
2. WHEN người bán gửi request xem chi tiết đơn hàng, THE Order Service SHALL kiểm tra quyền sở hữu trước khi trả về thông tin chi tiết
3. WHEN người bán cập nhật trạng thái đơn hàng thành "PROCESSING", THE Order Service SHALL publish event "order.status.updated" lên Kafka topic
4. WHEN người bán cập nhật trạng thái đơn hàng thành "SHIPPED", THE Order Service SHALL publish event "order.shipped" lên Kafka topic với thông tin productId và quantity
5. WHERE đơn hàng có nhiều sản phẩm từ nhiều seller khác nhau, THE Order Service SHALL cho phép mỗi seller chỉ cập nhật trạng thái của phần sản phẩm thuộc sở hữu họ

### Yêu cầu 3: Quản lý tồn kho

**User Story:** Là một người bán, tôi muốn theo dõi và cập nhật tồn kho sản phẩm để đảm bảo thông tin chính xác

#### Tiêu chí chấp nhận

1. WHEN người bán gửi request xem tồn kho, THE Product Service SHALL trả về thông tin stock của tất cả sản phẩm có ownerId khớp với sellerId
2. WHEN người bán cập nhật số lượng tồn kho, THE Product Service SHALL cập nhật trường stock và publish event "inventory.updated" lên Kafka topic
3. WHEN Order Service publish event "order.shipped", THE Product Service SHALL consume event và tự động trừ stock tương ứng
4. IF stock của sản phẩm giảm xuống dưới ngưỡng cảnh báo (10 đơn vị), THEN THE Product Service SHALL publish event "inventory.low" lên Kafka topic
5. WHILE stock của sản phẩm bằng 0, THE Product Service SHALL tự động set trường isActive thành false

### Yêu cầu 4: Thống kê và báo cáo

**User Story:** Là một người bán, tôi muốn xem thống kê về doanh số và sản phẩm để đưa ra quyết định kinh doanh

#### Tiêu chí chấp nhận

1. WHEN người bán gửi request xem thống kê doanh số, THE Order Service SHALL tính tổng doanh thu từ các đơn hàng có ownerId khớp với sellerId
2. WHEN người bán gửi request xem sản phẩm bán chạy, THE Order Service SHALL trả về danh sách sản phẩm được đặt nhiều nhất có ownerId khớp với sellerId
3. WHERE người bán chỉ định khoảng thời gian, THE Order Service SHALL lọc thống kê theo createdAt trong khoảng thời gian đó
4. WHEN người bán gửi request xem tổng quan dashboard, THE System SHALL tổng hợp dữ liệu từ Product Service và Order Service để trả về metrics tổng hợp

### Yêu cầu 5: Xác thực và phân quyền

**User Story:** Là hệ thống, tôi cần đảm bảo chỉ người bán hợp lệ mới có thể truy cập Seller Dashboard

#### Tiêu chí chấp nhận

1. WHEN request đến API Gateway, THE API Gateway SHALL xác thực JWT token và extract sellerId từ token
2. WHEN API Gateway forward request đến microservice, THE API Gateway SHALL thêm sellerId vào request header
3. IF token không hợp lệ hoặc thiếu, THEN THE API Gateway SHALL trả về lỗi 401 Unauthorized
4. IF user không có role "seller", THEN THE API Gateway SHALL trả về lỗi 403 Forbidden
5. WHEN microservice nhận request, THE microservice SHALL đọc sellerId từ header để filter dữ liệu

### Yêu cầu 6: Kafka Event Flow

**User Story:** Là hệ thống, tôi cần đảm bảo các microservices giao tiếp đồng bộ qua Kafka events

#### Tiêu chí chấp nhận

1. WHEN Order Service cập nhật trạng thái đơn hàng, THE Order Service SHALL publish event lên topic "order-events" với pattern "order.status.updated"
2. WHEN Product Service cần cập nhật inventory, THE Product Service SHALL consume event từ topic "order-events" với pattern "order.shipped"
3. WHEN Product Service cập nhật stock, THE Product Service SHALL publish event lên topic "inventory-events" với pattern "inventory.updated"
4. IF event processing thất bại, THEN THE consuming service SHALL log error và retry với exponential backoff tối đa 3 lần
5. WHEN event được publish, THE event payload SHALL chứa đầy đủ thông tin: eventId, timestamp, sellerId, và data liên quan
