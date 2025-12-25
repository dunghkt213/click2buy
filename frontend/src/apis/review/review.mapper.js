/**
 * Review Mapper - Maps backend review responses to frontend types
 */
export function mapReviewResponse(data) {
    return {
        id: data._id || data.id || '',
        userId: data.userId || '',
        // Ưu tiên trường "name" trực tiếp từ review, sau đó mới đến user.name hoặc user.username
        userName: data.name || data.user?.name || data.user?.username || 'Người dùng',
        userAvatar: data.user?.avatar,
        rating: data.rating || 0,
        comment: data.comment || '',
        images: data.images,
        date: data.updatedAt || data.createdAt || new Date().toISOString(), // Ưu tiên updatedAt
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        helpful: data.helpful || 0,
        isVerifiedPurchase: data.isVerifiedPurchase,
        replyBySeller: data.replyBySeller,
        user: data.user ? {
            name: data.user.name,
            username: data.user.username,
            avatar: data.user.avatar,
        } : undefined,
    };
}
