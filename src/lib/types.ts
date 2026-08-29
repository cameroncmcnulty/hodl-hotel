export type Figure = {
  gender?: number;
  skin: number;
  hair: number;
  hairColor: number;
  top: number;
  bottom: number;
  shoes: number;
  acc: number;
  topCut?: number;
  botCut?: number;
  shoeCut?: number;
  eyes?: number;
  face?: number;
};

export type Item = {
  uid: string;
  catalogId: string;
  pairId?: string;
  nftMint?: string;
  nftUrl?: string;
  ticker?: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  birthday: string;
  createdAt: string;
  role: "user" | "mod" | "admin";
  coins: number;
  figure: Figure;
  bannedUntil?: string;
  mutedUntil?: string;
  banReason?: string;
  friends: string[];
  friendIn: string[];
  friendOut: string[];
  roomHistory: { roomId: string; at: string }[];
  backpack: (Item | null)[];
  ownedRoomIds: string[];
  ownedLayoutIds?: string[];
  wallet?: string;
  quests: Record<string, { progress: number; done: boolean }>;
  tosAcceptedAt?: string;
  privacyAcceptedAt?: string;
  guidelinesAcceptedAt?: string;
  virtualGoodsAcceptedAt?: string;
  ageConfirmedAt?: string;
};

export type PublicUser = Omit<User, "passwordHash" | "email"> & { email?: string };

export type Placed = {
  uid: string;
  catalogId: string;
  x: number;
  y: number;
  rot: 0 | 1 | 2 | 3;
  ownerId: string;
  pairId?: string;
  nftMint?: string;
  nftUrl?: string;
  ticker?: string;
  adSlot?: string;
};

export type Room = {
  id: string;
  name: string;
  ownerId: string | null;
  layoutId: string;
  visibility: "public" | "locked";
  password?: string;
  furniture: Placed[];
  maxUsers: number;
  createdAt: string;
  lastActiveAt: string;
  publicKey?: string;
};

export type Occupant = {
  userId: string;
  username: string;
  figure: Figure;
  x: number;
  y: number;
  z: number;
  dir: 0 | 1 | 2 | 3;
  path: { x: number; y: number }[];
  sitUid?: string;
  dance?: boolean;
  moving?: boolean;
  dist?: number;
  chat?: { text: string; at: number };
  lastBeat: number;
};

export type ChatLine = {
  id: string;
  userId: string;
  username: string;
  text: string;
  at: number;
  kind: "chat" | "system" | "roll";
};

export type Thread = {
  id: string;
  a: string;
  b: string;
  messages: { id: string; from: string; text: string; at: string; read: boolean }[];
};

export type Trade = {
  id: string;
  a: string;
  b: string;
  aItems: Item[];
  bItems: Item[];
  aReady: boolean;
  bReady: boolean;
  aLock: boolean;
  bLock: boolean;
  roomId: string;
  status: "open" | "done" | "cancel";
};

export type Report = {
  id: string;
  fromId: string;
  targetId: string;
  reason: string;
  at: string;
  status: "open" | "closed";
};

export type Ad = {
  id: string;
  slotId: string;
  roomId: string;
  userId: string;
  image: string;
  plan: string;
  start: string;
  end: string;
  status: "live" | "removed";
};

export type Receipt = {
  id: string;
  userId: string;
  packId: string;
  sig: string;
  coins: number;
  sol: number;
  at: string;
};

export type HotelEvent = {
  id: string;
  title: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  desc: string;
  reward: number;
};

export type Settings = {
  treasuryWallet: string;
  chatEnabled: boolean;
  signupEnabled: boolean;
  maintenance: boolean;
  starterCoins: number;
};

export type Log = {
  id: string;
  at: string;
  kind: string;
  text: string;
};

export type DB = {
  users: User[];
  rooms: Room[];
  threads: Thread[];
  trades: Trade[];
  reports: Report[];
  ads: Ad[];
  receipts: Receipt[];
  events: HotelEvent[];
  settings: Settings;
  logs: Log[];
};
