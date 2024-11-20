export interface Menu {
  name: string;
  description?: string;
  price: number;
  category: Category;
  addedBy: string;
  editedBy?: string;
  isAvailable: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
  totalNutrition?: number;
  image?: string;
  hide?: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id?: string;
}

export interface Category {
  name: string;
  description?: string;
  icon?: string;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id?: string;
}

export interface NavBtn {
  name: string;
  icon?: string;
  active?: boolean;
  route?: string;
  action?: () => void;
}
