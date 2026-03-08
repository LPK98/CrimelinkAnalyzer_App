import { ImageSourcePropType } from "react-native";

export type weaponListItemType = {
  weapon?: weaponType;
  name?: string;
  imageUrl?: ImageSourcePropType;
};

export type weaponType = {
  serialNumber?: string;
  weaponType?: string;
  status?: string;
  updatedDate?: Date;
  registerDate?: Date;
};

export type WeaponRequestType = {
  requestId?: number;
  weaponSerial?: string;
  ammoCount?: number;
  requestedById?: number;
  requestNote?: string;
  status?: string;
  requestedAt?: Date;
  resolvedAt?: Date;
};
