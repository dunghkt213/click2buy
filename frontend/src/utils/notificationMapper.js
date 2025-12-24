/**
 * Map BackendNotification từ backend sang Notification type của frontend
 */
export function mapBackendNotificationToNotification(backendNoti) {
    // Map type từ backend (ORDER, CHAT, SYSTEM...) sang frontend type
    let frontendType = 'system';
    if (backendNoti.type === 'ORDER') {
        frontendType = 'order';
    }
    else if (backendNoti.type === 'CHAT') {
        frontendType = 'system'; // Chat notifications có thể hiển thị như system
    }
    else if (backendNoti.type === 'PROMOTION') {
        frontendType = 'promotion';
    }
    else if (backendNoti.type === 'REVIEW') {
        frontendType = 'review';
    }
    else {
        frontendType = 'system';
    }
    // Format time từ createdAt
    const createdAt = new Date(backendNoti.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    let timeStr = '';
    if (diffMins < 1) {
        timeStr = 'Vừa xong';
    }
    else if (diffMins < 60) {
        timeStr = `${diffMins} phút trước`;
    }
    else if (diffHours < 24) {
        timeStr = `${diffHours} giờ trước`;
    }
    else if (diffDays < 7) {
        timeStr = `${diffDays} ngày trước`;
    }
    else {
        timeStr = createdAt.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }
    return {
        id: backendNoti._id,
        type: frontendType,
        title: backendNoti.title,
        message: backendNoti.content,
        time: timeStr,
        isRead: backendNoti.isRead,
        metadata: backendNoti.metadata,
    };
}
