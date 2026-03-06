export type weaponListItemType = {
  weapon: weaponType;
};

export type weaponType = {
  serialNumber: string;
  weaponType: string;
  status: string;
  updatedDate: Date;
  registerDate: Date;
};
