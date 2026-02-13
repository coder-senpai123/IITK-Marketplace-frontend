export interface ChatUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ChatItem {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  status: 'active' | 'sold' | 'deleted';
}

export interface Chat {
  _id: string;
  participants: ChatUser[];
  item?: ChatItem;
  latestMessage?: {
    content: string;
    type?: string;
  };
  lastMessage?: string;
}