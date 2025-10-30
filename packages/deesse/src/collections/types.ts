export type Collection = {
  name: string;
  slug: string;
  fields: Record<string, Field[]>;
};

export type Field = {
  type: undefined;
  permissions: {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
  };
};
