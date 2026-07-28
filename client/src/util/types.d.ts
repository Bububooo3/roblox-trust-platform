// All numbers are integers
// Wrap DateTime -> string values in new Date(STRING) to convert

export type userData = {
  id: number;
  rblxUserID: number;
  robloxUsername: string;
  productAccountAge: number;
  robloxAccountAge: number;
  lastLogin: string;
  productAccountCreationDate: string;
};

export type transactionData = {
  transactionID: number;
  projectName: string;
  amountInCents: number;
  clientId: number;
  developerId: number;
  developerReviewId: number?;
  clientReviewId: number?;
  status: StatusMirror;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string?;
  description: string;
  currency: string;
};

export type reviewData = {
  reviewID: number;
  rating: number;
  description: string;
  reviewerId: number;
  revieweeId: number;
  linkedTransactionId: number;
};

export type mediaData = {
  mediaId: number;
  type: MediaTypeMirror;
  linkedTransactionId: number;
  contentID: number?;
  contentString: string?;
};

export type applicationData = {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  active: boolean;
};

// "ENUMS"
export type StatusMirror =
  | "Success"
  | "Cancelled"
  | "Reported"
  | "Pending"
  | "Ongoing";

export type MediaTypeMirror =
  | "link"
  | "picture"
  | "experience"
  | "group"
  | "asset";

export type paginatedResponse<T> = {
  data: T[];
  nextCursor: number | null;
};

export type transactionDataCollection = paginatedResponse<transactionData>;

export type reviewDataCollection = paginatedResponse<reviewData>;

export type jointDataReturn = {
  review: reviewData;
  transaction: transactionData;
};

export type exploreUserEntry = userData & {
  averageRating: number | null;
  transactionCount: number;
  volume: number;
};

export type exploreResponse = {
  data: exploreUserEntry[];
  page: number;
  totalPages: number;
  total: number;
};

export type platformStats = {
  userCount: number;
  transactionCount: number;
};
