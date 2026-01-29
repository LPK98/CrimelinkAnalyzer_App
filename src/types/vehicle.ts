export type Vehicle = {
  id?: number;
  numberPlate: string;
  ownerName: string;
  vehicleType: "Car" | "Van" | "Lorry" | "Motorcycle" | "Other" | string;
  status: "Stolen" | "Found" | "" | string;
  lostDate: string; // YYYY-MM-DD
};
