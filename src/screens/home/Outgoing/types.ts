export type TExistingFileSource = 'signedFiles' | 'mainFiles' | 'approvedFiles' | 'attachedFiles';
export type TExistingFile = {
  fileKey: string;
  filename: string;
  originalname: string;
  source?: TExistingFileSource;
};
export type TPickedFile = { uri: string; name: string; type: string; size?: number };
export type TLevelKey = 'CBNV' | 'PHONG_BAN' | 'VAN_THU' | 'BAN_GIAM_DOC';

export type TOutgoingItem = {
  id: string;
  title: string;
  code: string;
  time: string;
  step: string;
  status: string;
  rawStatus?: string;
};
