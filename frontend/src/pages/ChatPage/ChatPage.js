import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowLeft, Image as ImageIcon, Info, Loader2, MessageCircle, MoreVertical, Search, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { mediaApi } from '../../apis/media/mediaApi';
import { productApi } from '../../apis/product';
import { userApi } from '../../apis/user';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useChat } from '../../hooks/useChat';
import { useAppContext } from '../../providers/AppProvider';
// If direct image URL fails, will show clickable placeholder to open in new tab
const GoogleDriveImage = ({ url, originalUrl, className }) => {
    const [hasError, setHasError] = useState(false);
    // Handle image load error
    const handleImageError = () => {
        setHasError(true);
    };
    // If image fails to load, show clickable placeholder
    if (hasError) {
        return (_jsxs("div", { className: `${className} bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors rounded-2xl`, onClick: () => window.open(originalUrl, '_blank'), title: "Nh\u1EA5n \u0111\u1EC3 m\u1EDF h\u00ECnh \u1EA3nh trong tab m\u1EDBi", children: [_jsx(ImageIcon, { className: "w-12 h-12 text-muted-foreground mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground text-center px-4", children: "Kh\u00F4ng th\u1EC3 t\u1EA3i h\u00ECnh \u1EA3nh" }), _jsx("p", { className: "text-xs text-muted-foreground/70 mt-1 px-4", children: "Nh\u1EA5n \u0111\u1EC3 m\u1EDF trong tab m\u1EDBi" })] }));
    }
    // Render image with ImageWithFallback (same as product images)
    return (_jsxs("div", { className: "relative group cursor-pointer", onClick: () => window.open(originalUrl, '_blank'), title: "Nh\u1EA5n \u0111\u1EC3 m\u1EDF h\u00ECnh \u1EA3nh trong tab m\u1EDBi", children: [_jsx(ImageWithFallback, { src: url, alt: "Shared image", className: className, loading: "lazy", onError: handleImageError }), _jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none", children: _jsx("div", { className: "bg-black/70 text-white text-xs px-3 py-1.5 rounded-full", children: "Nh\u1EA5n \u0111\u1EC3 m\u1EDF" }) })] }));
};
export function ChatPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const app = useAppContext();
    const userId = app.user?.id || null;
    const chatSelectedProductKey = 'chat:selectedProductId';
    const chatSelectedProductSentKey = 'chat:selectedProductIdSent';
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingSelectedProduct, setLoadingSelectedProduct] = useState(false);
    const clearSelectedProductContext = useCallback(() => {
        sessionStorage.removeItem(chatSelectedProductKey);
        setSelectedProductId(null);
        setSelectedProduct(null);
    }, []);
    const [productMessageCache, setProductMessageCache] = useState({});
    const requestedProductMessageIdsRef = useRef(new Set());
    const parseProductIdFromMessage = useCallback((content) => {
        if (!content || typeof content !== 'string')
            return null;
        const match = content.trim().match(/^ProductID:([A-Za-z0-9_-]+)$/);
        return match?.[1] || null;
    }, []);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentReceiverId, setCurrentReceiverId] = useState(null);
    const [userInfoCache, setUserInfoCache] = useState({});
    const typingTimeoutRef = useRef(null);
    const [pendingMessage, setPendingMessage] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const messagesEndRef = useRef(null);
    const prevConversationIdRef = useRef(null);
    useEffect(() => {
        const storedId = sessionStorage.getItem(chatSelectedProductKey);
        setSelectedProductId(storedId);
    }, []);
    useEffect(() => {
        if (!selectedProductId) {
            setSelectedProduct(null);
            return;
        }
        let cancelled = false;
        setLoadingSelectedProduct(true);
        productApi
            .getById(selectedProductId)
            .then((p) => {
            if (cancelled)
                return;
            setSelectedProduct(p);
        })
            .catch(() => {
            if (cancelled)
                return;
            sessionStorage.removeItem(chatSelectedProductKey);
            sessionStorage.removeItem(chatSelectedProductSentKey);
            setSelectedProductId(null);
            setSelectedProduct(null);
        })
            .finally(() => {
            if (cancelled)
                return;
            setLoadingSelectedProduct(false);
        });
        return () => {
            cancelled = true;
        };
    }, [selectedProductId]);
    // Use chat hook
    const { messages, conversations, currentConversationId, setCurrentConversationId, isConnected, isTyping, loading, sendMessage, startConversation, loadMessages, markAsRead, sendTyping, } = useChat({ userId, autoConnect: true });
    // Function to open chat with a specific user - opens immediately
    const openChatWithUser = useCallback((targetUserId) => {
        if (!targetUserId || !userId)
            return;
        // Set receiverId immediately so user can see the chat interface
        setCurrentReceiverId(targetUserId);
        // Check if conversation already exists
        const existingConv = conversations.find(conv => conv.participants.includes(targetUserId) && conv.participants.includes(userId));
        if (existingConv) {
            // Normalize conversation ID
            const convId = existingConv.id || existingConv._id;
            if (convId) {
                setCurrentConversationId(convId);
                loadMessages(convId);
                // Mark as read
                markAsRead(convId);
            }
            else {
                console.error('Existing conversation has no ID:', existingConv);
                // Start new conversation
                startConversation(targetUserId);
            }
        }
        else {
            // Start new conversation immediately - receiverId already set above
            startConversation(targetUserId);
        }
    }, [startConversation, userId, conversations, loadMessages, setCurrentConversationId, markAsRead]);
    // Handle openChat event from other pages
    useEffect(() => {
        const handleOpenChat = (event) => {
            const { targetUserId } = event.detail;
            if (targetUserId) {
                openChatWithUser(targetUserId);
            }
        };
        window.addEventListener('openChat', handleOpenChat);
        return () => {
            window.removeEventListener('openChat', handleOpenChat);
        };
    }, [openChatWithUser]);
    // Track pending userId from URL to open when ready
    const [pendingUserId, setPendingUserId] = useState(null);
    // Handle userId from URL query params (when navigating from other pages)
    // Open immediately without waiting for conversations to load
    useEffect(() => {
        const userIdFromUrl = searchParams.get('userId');
        if (userIdFromUrl && userId) {
            // Set receiverId immediately for instant UI feedback
            setCurrentReceiverId(userIdFromUrl);
            setPendingUserId(userIdFromUrl);
            // Clean up URL param immediately
            navigate('/chat', { replace: true });
        }
    }, [searchParams, userId, navigate]);
    // Process pending userId when connected - open conversation immediately
    useEffect(() => {
        if (!pendingUserId || !userId || !isConnected)
            return;
        // Wait a bit for conversations to load if they haven't loaded yet
        // But don't wait too long - if conversations are empty after a short delay, start new conversation
        const checkAndOpen = () => {
            // Check if conversation already exists
            const existingConv = conversations.find(conv => conv.participants.includes(pendingUserId) && conv.participants.includes(userId));
            if (existingConv) {
                const convId = existingConv.id || existingConv._id;
                if (convId && convId !== currentConversationId) {
                    setCurrentConversationId(convId);
                    setCurrentReceiverId(pendingUserId);
                    loadMessages(convId);
                    markAsRead(convId);
                }
                setPendingUserId(null); // Clear pending
            }
            else {
                // If conversations list has been loaded (even if empty), start new conversation
                // We check if we've had time to load conversations (500ms delay)
                // If still no conversation found, start a new one
                startConversation(pendingUserId);
                // pendingUserId will be cleared when conversation is created and selected
            }
        };
        // Small delay to allow conversations to load, but not too long
        const timeoutId = setTimeout(checkAndOpen, 300);
        return () => clearTimeout(timeoutId);
    }, [pendingUserId, userId, isConnected, conversations, currentConversationId, startConversation, loadMessages, markAsRead, setCurrentConversationId]);
    // Set receiverId when conversation is created/selected
    useEffect(() => {
        if (currentConversationId && userId) {
            const conv = conversations.find(c => {
                const cId = c.id || c._id;
                return cId === currentConversationId;
            });
            if (conv) {
                // Find the other participant (not current user)
                const otherParticipant = conv.participants.find(p => p !== userId);
                if (otherParticipant && otherParticipant !== currentReceiverId) {
                    setCurrentReceiverId(otherParticipant);
                }
                // Clear pending if this is the conversation we were waiting for
                if (pendingUserId && conv.participants.includes(pendingUserId)) {
                    setPendingUserId(null);
                }
            }
        }
        else if (pendingUserId && !currentConversationId) {
            // If we have pendingUserId but no conversation yet, ensure receiverId is set
            if (currentReceiverId !== pendingUserId) {
                setCurrentReceiverId(pendingUserId);
            }
        }
    }, [currentConversationId, conversations, userId, currentReceiverId, pendingUserId]);
    // Ensure receiverId is set when pendingUserId changes
    useEffect(() => {
        if (pendingUserId && currentReceiverId !== pendingUserId) {
            setCurrentReceiverId(pendingUserId);
        }
    }, [pendingUserId, currentReceiverId]);
    // Load user info for currentReceiverId when it changes
    useEffect(() => {
        if (currentReceiverId && !userInfoCache[currentReceiverId]) {
            const loadUserInfo = async () => {
                try {
                    const userInfo = await userApi.findOne(currentReceiverId);
                    setUserInfoCache(prev => ({
                        ...prev,
                        [currentReceiverId]: {
                            name: userInfo.shopName || userInfo.name || 'Người dùng',
                            avatar: userInfo.avatar,
                        },
                    }));
                }
                catch (error) {
                    console.error('Failed to load user info:', error);
                }
            };
            loadUserInfo();
        }
    }, [currentReceiverId, userInfoCache]);
    // Load user info for conversations
    useEffect(() => {
        const loadUserInfo = async () => {
            for (const conv of conversations) {
                const otherParticipantId = conv.participants.find(p => p !== userId);
                if (otherParticipantId && !userInfoCache[otherParticipantId]) {
                    try {
                        const userInfo = await userApi.findOne(otherParticipantId);
                        setUserInfoCache(prev => ({
                            ...prev,
                            [otherParticipantId]: {
                                name: userInfo.shopName || userInfo.name || 'Người dùng',
                                avatar: userInfo.avatar,
                            },
                        }));
                    }
                    catch (error) {
                        console.error('Failed to load user info:', error);
                    }
                }
            }
        };
        if (conversations.length > 0) {
            loadUserInfo();
        }
    }, [conversations, userId, userInfoCache]);
    // Store messages by conversation
    const [messagesByConversation, setMessagesByConversation] = useState({});
    // Update messages by conversation when messages change
    useEffect(() => {
        // Only log in development mode and when messages actually change
        if (process.env.NODE_ENV === 'development' && messages.length > 0) {
            console.log('📦 Updating messagesByConversation, total messages:', messages.length);
        }
        const grouped = {};
        messages.forEach(msg => {
            if (msg.conversationId) {
                if (!grouped[msg.conversationId]) {
                    grouped[msg.conversationId] = [];
                }
                grouped[msg.conversationId].push(msg);
            }
            else {
                // Only warn in development
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Message without conversationId:', msg);
                }
            }
        });
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📦 Grouped messages by conversation:', grouped);
        }
        setMessagesByConversation(grouped);
    }, [messages]);
    // Enhanced conversations with user info
    const enhancedConversations = useMemo(() => {
        const getMessagePreview = (msg) => {
            if (!msg)
                return '';
            if (typeof msg === 'string')
                return msg.trim();
            const raw = String(msg.content ?? '').trim();
            const type = msg.type;
            const lower = raw.toLowerCase();
            const isGoogleDriveThumbnail = lower.includes('drive.google.com/thumbnail?id=');
            const looksLikeImageUrl = lower.startsWith('http') &&
                (lower.includes('drive.google.com') ||
                    lower.includes('res.cloudinary.com') ||
                    lower.includes('images.unsplash.com') ||
                    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/.test(lower));
            if (isGoogleDriveThumbnail)
                return 'Đã gửi một ảnh';
            if (type === 'image' || looksLikeImageUrl)
                return 'Đã gửi một hình ảnh';
            if (type === 'file')
                return 'Đã gửi một tệp';
            return raw;
        };
        const getLatestMessage = (msgs) => {
            if (!msgs || msgs.length === 0)
                return null;
            return msgs.reduce((latest, current) => {
                if (!latest)
                    return current;
                const t1 = new Date(latest.timestamp).getTime();
                const t2 = new Date(current.timestamp).getTime();
                if (isNaN(t2))
                    return latest;
                if (isNaN(t1))
                    return current;
                return t2 > t1 ? current : latest;
            }, null);
        };
        return conversations
            .map(conv => {
            // Use _id if id is not available (backend returns _id)
            const conversationId = conv.id || conv._id;
            if (!conversationId) {
                console.warn('Conversation without ID:', conv);
                return null;
            }
            const otherParticipantId = conv.participants.find(p => p !== userId);
            const userInfo = otherParticipantId ? userInfoCache[otherParticipantId] : null;
            // Handle unreadCount - can be number or object
            let unreadCountValue = 0;
            if (typeof conv.unreadCount === 'number') {
                unreadCountValue = conv.unreadCount;
            }
            else if (typeof conv.unreadCount === 'object' && conv.unreadCount && userId) {
                unreadCountValue = conv.unreadCount[userId] || 0;
            }
            return {
                ...conv,
                id: conversationId, // Normalize to 'id'
                sellerId: otherParticipantId || '',
                sellerName: userInfo?.name || 'Người dùng',
                sellerAvatar: userInfo?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User',
                sellerStatus: 'online', // TODO: Get real status from backend
                lastMessage: (() => {
                    const convMessages = messagesByConversation[conversationId] ||
                        messagesByConversation[conv._id || ''] ||
                        [];
                    const latest = getLatestMessage(convMessages);
                    const fromBackend = getMessagePreview(conv.lastMessage);
                    if (fromBackend)
                        return fromBackend;
                    return getMessagePreview(latest);
                })(),
                lastMessageTime: (() => {
                    const convMessages = messagesByConversation[conversationId] ||
                        messagesByConversation[conv._id || ''] ||
                        [];
                    const latest = getLatestMessage(convMessages);
                    return (conv.lastMessageTime ||
                        conv.lastMessageAt ||
                        conv.lastMessage?.timestamp ||
                        latest?.timestamp ||
                        '');
                })(),
                unreadCount: unreadCountValue,
                messages: (() => {
                    // Try to get messages by normalized conversationId
                    const convMessages = messagesByConversation[conversationId] ||
                        messagesByConversation[conv._id || ''] ||
                        [];
                    // Removed console.log to prevent spam - only log in development if needed
                    // console.log(`📦 Messages for conversation ${conversationId}:`, {
                    //   conversationId,
                    //   _id: conv._id,
                    //   messagesByConvId: messagesByConversation[conversationId]?.length || 0,
                    //   messagesBy_id: messagesByConversation[conv._id || '']?.length || 0,
                    //   finalMessages: convMessages.length,
                    // });
                    return convMessages;
                })(),
            };
        })
            .filter((conv) => conv !== null); // Remove null entries
    }, [conversations, messagesByConversation, userId, userInfoCache]);
    const selectedConversation = enhancedConversations.find(c => {
        const cId = c.id || c._id;
        return cId === currentConversationId;
    });
    // Create virtual conversation when we have receiverId but no conversation yet
    const virtualConversation = useMemo(() => {
        if (!currentReceiverId || selectedConversation)
            return null;
        const receiverInfo = userInfoCache[currentReceiverId];
        // Create virtual conversation even if we don't have user info yet
        // It will be updated when user info loads
        return {
            id: null,
            sellerId: currentReceiverId,
            sellerName: receiverInfo?.name || 'Người dùng',
            sellerAvatar: receiverInfo?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User',
            sellerStatus: 'online',
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            messages: [],
        };
    }, [currentReceiverId, selectedConversation, userInfoCache]);
    // Use virtual conversation if no selected conversation but we have receiverId
    const activeConversation = selectedConversation || virtualConversation;
    useEffect(() => {
        if (!activeConversation)
            return;
        const ids = new Set();
        for (const m of activeConversation.messages || []) {
            const id = parseProductIdFromMessage(m?.content);
            if (id)
                ids.add(id);
        }
        ids.forEach((id) => {
            if (requestedProductMessageIdsRef.current.has(id))
                return;
            requestedProductMessageIdsRef.current.add(id);
            setProductMessageCache((prev) => {
                if (prev[id])
                    return prev;
                return {
                    ...prev,
                    [id]: { status: 'loading' },
                };
            });
            productApi
                .getById(id)
                .then((p) => {
                setProductMessageCache((prev) => ({
                    ...prev,
                    [id]: { status: 'loaded', product: p },
                }));
            })
                .catch(() => {
                setProductMessageCache((prev) => ({
                    ...prev,
                    [id]: { status: 'error' },
                }));
            });
        });
    }, [activeConversation, parseProductIdFromMessage]);
    // Debug: Log active conversation messages (only in development, and only when conversation actually changes)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && activeConversation) {
            const conversationId = activeConversation.id;
            // Only log when conversation ID changes, not on every render
            if (prevConversationIdRef.current !== conversationId) {
                console.log('📋 Active conversation changed:', {
                    conversationId: activeConversation.id,
                    messageCount: activeConversation.messages.length,
                });
                prevConversationIdRef.current = conversationId || null;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversation?.id]);
    // Auto-scroll to bottom when messages change or conversation changes
    useEffect(() => {
        if (messagesEndRef.current && activeConversation) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [activeConversation?.messages.length, currentConversationId]);
    const filteredConversations = enhancedConversations.filter(conv => conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));
    // Auto-send pending message when conversation is created
    useEffect(() => {
        if (!pendingMessage)
            return;
        if (!currentConversationId)
            return;
        // Validate conversationId before sending
        const validConversationId = currentConversationId.trim();
        if (!validConversationId || validConversationId === '') {
            console.error('❌ Cannot auto-send: conversationId is invalid:', {
                currentConversationId,
                validConversationId,
                type: typeof currentConversationId,
            });
            return;
        }
        console.log('📤 Auto-sending pending message after conversation created:', {
            pendingMessage,
            conversationId: validConversationId,
            conversationIdLength: validConversationId.length,
        });
        // Small delay to ensure conversation is fully set up
        const timeoutId = setTimeout(() => {
            void (async () => {
                // Re-validate conversationId after timeout
                const finalConversationId = currentConversationId?.trim();
                if (finalConversationId && finalConversationId !== '') {
                    console.log('📤 Executing auto-send with conversationId:', finalConversationId);
                    if (selectedProductId && sessionStorage.getItem(chatSelectedProductSentKey) !== '1') {
                        sendMessage(`ProductID:${selectedProductId}`, pendingMessage.receiverId, finalConversationId);
                        sessionStorage.setItem(chatSelectedProductSentKey, '1');
                        clearSelectedProductContext();
                        await new Promise((resolve) => setTimeout(resolve, 150));
                    }
                    sendMessage(pendingMessage.content, pendingMessage.receiverId, finalConversationId);
                    setPendingMessage(null);
                }
                else {
                    console.error('❌ ConversationId became invalid during timeout:', {
                        currentConversationId,
                        finalConversationId,
                    });
                    setPendingMessage(null); // Clear pending to avoid infinite loop
                }
            })();
        }, 500); // Increased delay to ensure conversation is fully set up
        return () => clearTimeout(timeoutId);
    }, [currentConversationId, pendingMessage, sendMessage, selectedProductId, clearSelectedProductContext]);
    const sendSelectedProductIdTagIfNeeded = useCallback((receiverId, conversationId) => {
        if (!selectedProductId)
            return false;
        if (sessionStorage.getItem(chatSelectedProductSentKey) === '1')
            return false;
        sendMessage(`ProductID:${selectedProductId}`, receiverId, conversationId);
        sessionStorage.setItem(chatSelectedProductSentKey, '1');
        clearSelectedProductContext();
        return true;
    }, [selectedProductId, sendMessage, clearSelectedProductContext]);
    const handleSendMessage = async (imageUrl) => {
        const content = imageUrl || message.trim();
        if (!content) {
            return;
        }
        if (!userId) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        if (!isConnected) {
            toast.error('Chưa kết nối đến dịch vụ chat. Đang thử kết nối...');
            return;
        }
        let conversationId = currentConversationId;
        let receiverId = currentReceiverId;
        // If no conversation selected but we have a receiver, start new conversation
        if (!conversationId && receiverId) {
            console.log('No conversation ID, starting new conversation with:', receiverId);
            // Save message to send after conversation is created
            setPendingMessage({ content, receiverId });
            startConversation(receiverId);
            setMessage(''); // Clear input
            toast.info('Đang tạo cuộc trò chuyện...');
            return; // Will auto-send after conversation is created
        }
        // If we have active conversation, use its data
        if (activeConversation) {
            receiverId = activeConversation.sellerId;
            conversationId = activeConversation.id || null;
        }
        if (!receiverId) {
            toast.error('Không tìm thấy người nhận');
            return;
        }
        // If no conversationId but we have receiverId, start conversation first
        if (!conversationId && receiverId) {
            console.log('No conversation ID, starting new conversation with:', receiverId);
            // Save message to send after conversation is created
            setPendingMessage({ content, receiverId });
            startConversation(receiverId);
            setMessage(''); // Clear input
            toast.info('Đang tạo cuộc trò chuyện...');
            return; // Will auto-send after conversation is created
        }
        // conversationId is REQUIRED by backend
        if (!conversationId) {
            console.error(' Cannot send message: conversationId is missing', {
                currentConversationId,
                activeConversation,
                receiverId,
            });
            toast.error('Vui lòng đợi cuộc trò chuyện được tạo');
            return;
        }
        console.log(' Sending message from UI:', {
            content,
            receiverId,
            conversationId,
            isConnected,
            userId,
            isImage: !!imageUrl,
        });
        try {
            const didSendTag = sendSelectedProductIdTagIfNeeded(receiverId, conversationId);
            if (didSendTag) {
                await new Promise((resolve) => setTimeout(resolve, 150));
            }
            // Send message with image URL if provided
            // Note: Backend expects content field, we'll send image URL as content
            // and type will be set by backend based on content or we need to handle it
            sendMessage(content, receiverId, conversationId);
            setMessage('');
        }
        catch (error) {
            console.error('❌ Error sending message:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    };
    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 10MB');
            return;
        }
        setUploadingImage(true);
        try {
            const response = await mediaApi.upload(file);
            console.log('📤 Media upload response:', response);
            // Handle response format: { url: { fileId, thumbnailUrl } } or { url: string }
            const imageUrl = typeof response?.url === 'string'
                ? response.url
                : response?.url?.thumbnailUrl || '';
            if (!imageUrl) {
                console.error('Invalid response format:', response);
                toast.error('Không nhận được URL ảnh từ server');
                return;
            }
            console.log('✅ Image uploaded successfully, URL:', imageUrl);
            console.log('✅ isImageUrl check:', isImageUrl(imageUrl));
            // Send message with image URL
            await handleSendMessage(imageUrl);
            toast.success('Đã gửi ảnh thành công');
        }
        catch (error) {
            console.error('❌ Error uploading image:', error);
            toast.error(`Lỗi khi tải ảnh: ${error?.message || 'Không xác định'}`);
        }
        finally {
            setUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };
    const handleSelectConversation = (convId) => {
        console.log('Selecting conversation:', convId);
        if (!convId) {
            console.error('❌ Cannot select conversation: ID is undefined');
            toast.error('Không thể chọn cuộc trò chuyện này (ID không hợp lệ)');
            return;
        }
        if (currentConversationId === convId) {
            console.log('Conversation already selected');
            return;
        }
        try {
            const conv = enhancedConversations.find(c => c.id === convId);
            if (!conv) {
                console.error('Conversation not found:', convId);
                toast.error('Không tìm thấy cuộc trò chuyện này');
                return;
            }
            setCurrentConversationId(convId);
            setCurrentReceiverId(conv.sellerId);
            if (isConnected) {
                markAsRead(convId);
            }
        }
        catch (error) {
            console.error('Error selecting conversation:', error);
            toast.error('Không thể chọn cuộc trò chuyện này');
        }
    };
    const handleTyping = (typing) => {
        if (!currentReceiverId || !isConnected)
            return;
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (typing) {
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(currentReceiverId, false);
            }, 3000);
        }
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diffInMinutes < 1)
            return 'Vừa xong';
        if (diffInMinutes < 60)
            return `${diffInMinutes} phút`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)} giờ`;
        if (diffInMinutes < 10080)
            return `${Math.floor(diffInMinutes / 1440)} ngày`;
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    };
    const formatMessageTime = (timestamp) => {
        if (!timestamp)
            return '';
        try {
            // Handle different timestamp formats
            let date;
            if (typeof timestamp === 'number') {
                // If it's a number, assume it's milliseconds or seconds
                date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
            }
            else if (typeof timestamp === 'string') {
                // Try parsing as ISO string or other formats
                date = new Date(timestamp);
            }
            else {
                console.warn('Invalid timestamp type:', typeof timestamp, timestamp);
                return '';
            }
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid timestamp value:', timestamp);
                return '';
            }
            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInMinutes = Math.floor(diffInMs / 60000);
            // If less than 1 minute, show "Vừa xong"
            if (diffInMinutes < 1) {
                return 'Vừa xong';
            }
            // If same day, show time only
            const isToday = date.toDateString() === now.toDateString();
            if (isToday) {
                return date.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            // If same year, show date and time
            const isSameYear = date.getFullYear() === now.getFullYear();
            if (isSameYear) {
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            // Otherwise show full date and time
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        catch (error) {
            console.error('Error formatting time:', error, timestamp);
            return '';
        }
    };
    // Convert Google Drive URLs to direct image URLs that can be loaded in img tag
    // Backend returns: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
    // We need to convert to direct image URL that works in img tag
    const convertGoogleDriveUrl = (url) => {
        if (!url || typeof url !== 'string')
            return url;
        const trimmedUrl = url.trim();
        // Extract file ID from various Google Drive URL formats
        let fileId = null;
        // Handle Google Drive thumbnail URL: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
        // This is the most common format from backend
        if (trimmedUrl.includes('drive.google.com/thumbnail')) {
            // Match: ?id=FILE_ID or &id=FILE_ID
            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // Handle Google Drive file URL: https://drive.google.com/file/d/FILE_ID/view
        else if (trimmedUrl.includes('drive.google.com/file/d/')) {
            const match = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // Handle Google Drive uc URL: https://drive.google.com/uc?id=FILE_ID
        else if (trimmedUrl.includes('drive.google.com/uc')) {
            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // If we found a file ID, convert to direct image URL
        if (fileId) {
            // Use Google's direct image serving (lh3.googleusercontent.com)
            // Format: https://lh3.googleusercontent.com/d/FILE_ID
            // This format works best for embedding in img tags
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
        // If it's not a Google Drive URL, return as is
        return url;
    };
    // Check if content is an image URL
    // Specifically handles Google Drive thumbnail URLs: https://drive.google.com/thumbnail?id=
    const isImageUrl = (content) => {
        if (!content || typeof content !== 'string') {
            return false;
        }
        const trimmedContent = content.trim();
        // Check if it's a URL
        if (!trimmedContent.startsWith('http://') && !trimmedContent.startsWith('https://')) {
            return false;
        }
        const lowerContent = trimmedContent.toLowerCase();
        // Priority 1: Check for Google Drive URLs (most common in this app)
        // Specifically check for thumbnail format: drive.google.com/thumbnail?id=
        const isGoogleDriveThumbnail = lowerContent.includes('drive.google.com/thumbnail') && lowerContent.includes('id=');
        const isGoogleDriveFile = lowerContent.includes('drive.google.com/file/d/');
        const isGoogleDriveUc = lowerContent.includes('drive.google.com/uc') && lowerContent.includes('id=');
        const isGoogleDrive = isGoogleDriveThumbnail || isGoogleDriveFile || isGoogleDriveUc;
        // Priority 2: Check if it's an image file extension (even with query params)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
        const hasImageExtension = imageExtensions.some(ext => {
            // Check if extension exists in URL (before query params or at the end)
            const urlWithoutQuery = lowerContent.split('?')[0].split('#')[0];
            return urlWithoutQuery.endsWith(ext);
        });
        // Priority 3: Check for common image hosting patterns
        const hasImagePattern = lowerContent.includes('/image/') ||
            lowerContent.includes('cloudinary') ||
            lowerContent.includes('imgur') ||
            lowerContent.includes('i.imgur') ||
            lowerContent.includes('res.cloudinary.com') ||
            lowerContent.includes('images.unsplash.com') ||
            lowerContent.includes('lh3.googleusercontent.com') ||
            lowerContent.includes('media/') ||
            lowerContent.includes('/upload/');
        return isGoogleDrive || hasImageExtension || hasImagePattern;
    };
    // --- QUYẾT ĐỊNH HIỂN THỊ DỰA TRÊN Context ---
    if (!app.isLoggedIn) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg mb-4", children: "Vui l\u00F2ng \u0111\u0103ng nh\u1EADp \u0111\u1EC3 s\u1EED d\u1EE5ng chat" }), _jsx("button", { onClick: () => app.handleLogin(), className: "px-4 py-2 bg-primary text-primary-foreground rounded-md", children: "\u0110\u0103ng nh\u1EADp" })] }) }));
    }
    return (_jsxs("div", { className: "flex h-screen bg-background", children: [_jsxs("div", { className: "w-[380px] border-r border-border flex flex-col bg-white", children: [_jsxs("div", { className: "p-4 border-b border-border flex items-center gap-3 bg-white", children: [_jsx("button", { onClick: () => {
                                    sessionStorage.removeItem(chatSelectedProductKey);
                                    sessionStorage.removeItem(chatSelectedProductSentKey);
                                    setSelectedProductId(null);
                                    setSelectedProduct(null);
                                    navigate(-1);
                                }, className: "p-2 hover:bg-accent rounded-md transition-colors flex-shrink-0", children: _jsx(ArrowLeft, { className: "h-5 w-5" }) }), _jsx("h2", { className: "text-lg font-semibold flex-1", children: "Tin nh\u1EAFn" })] }), _jsx("div", { className: "p-3 border-b border-border bg-white", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "T\u00ECm ki\u1EBFm shop...", className: "w-full rounded-lg bg-accent/50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-colors" })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: loading && filteredConversations.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) })) : filteredConversations.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full p-4 text-center", children: [_jsx(MessageCircle, { className: "w-12 h-12 text-muted-foreground mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Ch\u01B0a c\u00F3 cu\u1ED9c tr\u00F2 chuy\u1EC7n n\u00E0o" })] })) : (filteredConversations.map((conv) => {
                            // Only render conversations with valid IDs
                            if (!conv.id) {
                                console.warn('Conversation without ID:', conv);
                                return null;
                            }
                            const isSelected = currentConversationId === conv.id;
                            return (_jsxs("button", { onClick: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (conv.id) {
                                        handleSelectConversation(conv.id);
                                    }
                                }, disabled: loading && isSelected, className: `w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0 ${isSelected ? 'bg-accent' : 'bg-white'} ${loading && isSelected ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`, children: [_jsxs("div", { className: "relative flex-shrink-0", children: [_jsx(ImageWithFallback, { src: conv.sellerAvatar, alt: conv.sellerName, className: "h-14 w-14 rounded-full object-cover border-2 border-border" }), _jsx("span", { className: `absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${conv.sellerStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}` })] }), _jsxs("div", { className: "flex-1 min-w-0 text-left", children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("h4", { className: "truncate font-medium text-sm", children: conv.sellerName }), _jsx("span", { className: "text-xs text-muted-foreground flex-shrink-0 ml-2", children: formatTime(conv.lastMessageTime) })] }), _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: `text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`, children: conv.lastMessage || 'Chưa có tin nhắn' }), conv.unreadCount > 0 && (_jsx("span", { className: "flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground", children: conv.unreadCount > 9 ? '9+' : conv.unreadCount }))] })] })] }, conv.id));
                        })) })] }), activeConversation ? (_jsxs("div", { className: "flex-1 flex flex-col bg-background", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border p-4 bg-white shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx(ImageWithFallback, { src: activeConversation.sellerAvatar, alt: activeConversation.sellerName, className: "h-12 w-12 rounded-full object-cover border-2 border-border" }), _jsx("span", { className: `absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${activeConversation.sellerStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}` })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: activeConversation.sellerName }), _jsx("p", { className: "text-xs text-muted-foreground", children: activeConversation.sellerStatus === 'online' ? 'Đang hoạt động' : 'Không hoạt động' })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { className: "p-2 hover:bg-accent rounded-md transition-colors", title: "Th\u00F4ng tin", children: _jsx(Info, { className: "h-5 w-5 text-muted-foreground" }) }), _jsx("button", { className: "p-2 hover:bg-accent rounded-md transition-colors", children: _jsx(MoreVertical, { className: "h-5 w-5 text-muted-foreground" }) })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20", children: loading && activeConversation.messages.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) })) : activeConversation.messages.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageCircle, { className: "w-12 h-12 text-muted-foreground mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Ch\u01B0a c\u00F3 tin nh\u1EAFn n\u00E0o. B\u1EAFt \u0111\u1EA7u tr\u00F2 chuy\u1EC7n!" })] }) })) : (_jsxs(_Fragment, { children: [activeConversation.messages
                                    .sort((a, b) => {
                                    try {
                                        const timeA = new Date(a.timestamp).getTime();
                                        const timeB = new Date(b.timestamp).getTime();
                                        if (isNaN(timeA) || isNaN(timeB))
                                            return 0;
                                        return timeA - timeB;
                                    }
                                    catch {
                                        return 0;
                                    }
                                })
                                    .map((msg) => {
                                    const isUser = msg.senderId === userId;
                                    const senderInfo = userInfoCache[msg.senderId];
                                    return (_jsxs("div", { className: `flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`, children: [!isUser && (_jsx(ImageWithFallback, { src: senderInfo?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User', alt: senderInfo?.name || 'Người dùng', className: "h-9 w-9 rounded-full flex-shrink-0 object-cover border border-border" })), _jsxs("div", { className: `flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`, children: [(() => {
                                                        const productIdFromTag = parseProductIdFromMessage(msg.content);
                                                        if (productIdFromTag) {
                                                            const entry = productMessageCache[productIdFromTag];
                                                            const bubbleBaseClass = `rounded-2xl overflow-hidden border border-border shadow-sm bg-white ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`;
                                                            if (!entry || entry.status === 'loading') {
                                                                return (_jsx("div", { className: bubbleBaseClass, children: _jsxs("div", { className: "flex items-center gap-3 p-3", children: [_jsx("div", { className: "h-12 w-12 rounded-md border border-border bg-background flex items-center justify-center", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }), _jsx("div", { className: "min-w-0", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "\u0110ang t\u1EA3i s\u1EA3n ph\u1EA9m..." }) })] }) }));
                                                            }
                                                            if (entry.status === 'error' || !entry.product) {
                                                                return (_jsx("div", { className: bubbleBaseClass, children: _jsxs("div", { className: "flex items-center gap-3 p-3", children: [_jsx("div", { className: "h-12 w-12 rounded-md border border-border bg-background flex items-center justify-center", children: _jsx("span", { className: "text-xs text-muted-foreground", children: "N/A" }) }), _jsx("div", { className: "min-w-0", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Kh\u00F4ng th\u1EC3 t\u1EA3i s\u1EA3n ph\u1EA9m" }) })] }) }));
                                                            }
                                                            return (_jsx("button", { onClick: () => navigate(`/product/${productIdFromTag}`), className: `${bubbleBaseClass} text-left hover:shadow-md transition-shadow`, type: "button", children: _jsxs("div", { className: "flex items-center gap-3 p-3", children: [_jsx("div", { className: "h-12 w-12 flex-shrink-0 rounded-md border border-border bg-background overflow-hidden", children: _jsx(ImageWithFallback, { src: entry.product.image, alt: entry.product.name, className: "h-12 w-12 object-cover", loading: "lazy" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "S\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-sm font-medium truncate", children: entry.product.name })] })] }) }));
                                                        }
                                                        // Check for images array first (multiple images in one message)
                                                        const messageImages = msg.images;
                                                        const hasImagesArray = Array.isArray(messageImages) && messageImages.length > 0;
                                                        // Determine if this is an image message
                                                        // Check multiple conditions:
                                                        // 1. msg.type === 'image'
                                                        // 2. msg.imageUrl exists
                                                        // 3. msg.images array exists
                                                        // 4. msg.content is an image URL
                                                        const rawImageUrl = msg.imageUrl || msg.content;
                                                        const hasImageUrlField = !!msg.imageUrl;
                                                        const isTypeImage = msg.type === 'image';
                                                        const contentIsImage = isImageUrl(msg.content || '');
                                                        const isImage = isTypeImage || hasImageUrlField || contentIsImage || hasImagesArray;
                                                        // Debug log in development
                                                        if (process.env.NODE_ENV === 'development') {
                                                            console.log('🖼️ Message check:', {
                                                                id: msg.id,
                                                                type: msg.type,
                                                                hasImageUrlField,
                                                                hasImagesArray,
                                                                imagesCount: hasImagesArray ? messageImages.length : 0,
                                                                contentIsImage,
                                                                isImage,
                                                                content: msg.content?.substring(0, 100),
                                                                rawImageUrl: rawImageUrl?.substring(0, 100),
                                                            });
                                                        }
                                                        // Render multiple images if images array exists
                                                        if (hasImagesArray) {
                                                            return (_jsx("div", { className: "flex flex-col gap-2", children: messageImages.map((img, idx) => {
                                                                    const imageUrl = convertGoogleDriveUrl(img);
                                                                    const isGoogleDrive = img.includes('drive.google.com');
                                                                    return (_jsx("div", { className: "rounded-2xl overflow-hidden max-w-[400px] shadow-md hover:shadow-lg transition-shadow bg-muted/50", children: isGoogleDrive ? (_jsx(GoogleDriveImage, { url: imageUrl, originalUrl: img, className: "max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity block" })) : (_jsx(ImageWithFallback, { src: imageUrl, alt: `Shared image ${idx + 1}`, className: "max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity block", onClick: () => window.open(img, '_blank'), loading: "lazy" })) }, idx));
                                                                }) }));
                                                        }
                                                        // Only render single image if we have a valid URL
                                                        if (isImage && rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim()) {
                                                            // Convert Google Drive URLs to direct image URLs
                                                            const imageUrl = convertGoogleDriveUrl(rawImageUrl);
                                                            const isGoogleDrive = rawImageUrl.includes('drive.google.com');
                                                            if (process.env.NODE_ENV === 'development') {
                                                                console.log('🖼️ Rendering image:', {
                                                                    rawImageUrl: rawImageUrl.substring(0, 100),
                                                                    imageUrl: imageUrl.substring(0, 100),
                                                                    isGoogleDrive,
                                                                });
                                                            }
                                                            return (_jsx("div", { className: "rounded-2xl overflow-hidden max-w-[400px] shadow-md hover:shadow-lg transition-shadow bg-muted/50", children: isGoogleDrive ? (_jsx(GoogleDriveImage, { url: imageUrl, originalUrl: rawImageUrl, className: "max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity block" })) : (_jsx(ImageWithFallback, { src: imageUrl, alt: "Shared image", className: "max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity block", onClick: () => window.open(rawImageUrl, '_blank'), loading: "lazy" })) }));
                                                        }
                                                        // Regular text message - only show if content exists and is not an image URL
                                                        if (msg.content && !contentIsImage) {
                                                            return (_jsx("div", { className: `rounded-2xl px-4 py-2.5 shadow-sm ${isUser
                                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                                    : 'bg-white text-foreground rounded-bl-sm border border-border'}`, children: _jsx("p", { className: "break-words text-sm leading-relaxed whitespace-pre-wrap", children: msg.content }) }));
                                                        }
                                                        // Fallback: if content is empty or only image URL, show nothing or placeholder
                                                        return null;
                                                    })(), msg.timestamp && (_jsx("span", { className: "text-xs text-muted-foreground px-1.5", children: formatMessageTime(msg.timestamp) }))] })] }, msg.id));
                                }), isTyping[currentReceiverId || ''] && (_jsxs("div", { className: "flex gap-3 items-end", children: [_jsx("div", { className: "h-9 w-9 rounded-full bg-muted flex-shrink-0 border border-border" }), _jsx("div", { className: "bg-white rounded-2xl rounded-bl-sm border border-border px-4 py-3 shadow-sm", children: _jsxs("div", { className: "flex gap-1.5", children: [_jsx("span", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("span", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("span", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: '300ms' } })] }) })] })), _jsx("div", { ref: messagesEndRef })] })) }), _jsxs("div", { className: "border-t border-border p-4 bg-white shadow-lg", children: [selectedProductId ? (_jsxs("div", { className: "mb-3 flex items-center gap-3 rounded-lg border border-border bg-accent/30 p-3", children: [_jsx("div", { className: "h-12 w-12 flex-shrink-0 rounded-md border border-border bg-background overflow-hidden", children: loadingSelectedProduct || !selectedProduct ? (_jsx("div", { className: "h-full w-full flex items-center justify-center", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) })) : (_jsx(ImageWithFallback, { src: selectedProduct.image, alt: selectedProduct.name, className: "h-12 w-12 object-cover", loading: "lazy" })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "S\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-sm font-medium truncate", children: selectedProduct?.name || '' })] })] })) : null, _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageSelect, className: "hidden" }), _jsx("button", { onClick: handleImageButtonClick, disabled: uploadingImage || !isConnected || !currentReceiverId, className: "p-2.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", title: "G\u1EEDi h\u00ECnh \u1EA3nh", children: uploadingImage ? (_jsx(Loader2, { className: "h-5 w-5 text-muted-foreground animate-spin" })) : (_jsx(ImageIcon, { className: "h-5 w-5 text-muted-foreground" })) }), _jsx("div", { className: "flex-1 relative flex items-center", children: _jsx("textarea", { value: message, onChange: (e) => {
                                                setMessage(e.target.value);
                                                handleTyping(true);
                                            }, onFocus: () => handleTyping(true), onBlur: () => handleTyping(false), onKeyDown: (e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                    handleTyping(false);
                                                }
                                            }, placeholder: "Nh\u1EADp tin nh\u1EAFn...", rows: 1, className: "w-full rounded-lg border border-border px-4 py-2.5 resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 bg-background text-sm min-h-[44px] max-h-[120px] flex items-center", style: {
                                                maxHeight: '120px',
                                                lineHeight: '1.5',
                                            }, disabled: !isConnected || !currentReceiverId }) }), _jsx("button", { onClick: () => handleSendMessage(), disabled: !message.trim() || !isConnected || uploadingImage || !currentReceiverId, className: "p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg flex items-center justify-center h-[44px] w-[44px]", children: _jsx(Send, { className: "h-5 w-5" }) })] })] })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageCircle, { className: "w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" }), _jsx("p", { className: "text-lg font-medium text-muted-foreground", children: "Ch\u1ECDn m\u1ED9t cu\u1ED9c tr\u00F2 chuy\u1EC7n \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u" }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Ho\u1EB7c t\u00ECm ki\u1EBFm shop \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u tr\u00F2 chuy\u1EC7n" })] }) }))] }));
}
