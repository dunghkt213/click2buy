/**
 * User Mapper - Maps backend user responses to frontend types
 */
export function normalizeUser(backendUser) {
    const fallbackName = backendUser.name || backendUser.username || backendUser.email || 'Người dùng';
    return {
        id: backendUser.id || backendUser._id || '',
        name: fallbackName,
        email: backendUser.email || '',
        avatar: backendUser.avatar,
        membershipLevel: 'Bronze',
        points: 0,
        role: backendUser.role,
    };
}
