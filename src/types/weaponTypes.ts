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
  imageUrl?: string;
};

export type WeaponRequestType = {
  requestId?: number;
  weaponSerial?: string;
  ammoCount?: number;
  requestedById?: number;
  requestNote?: string;
  status?: string;
  requestedAt?: string | Date;
  resolvedAt?: string | Date;
};

export type AssignedWeapon = {
  id: number | string;
  weaponType?: string;
  status?: string;
  ammoCount?: number;
  totalAmmo?: number;
  dueDate?: string;
};
