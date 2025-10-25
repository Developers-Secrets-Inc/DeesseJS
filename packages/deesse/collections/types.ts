


type Collection = {
    slug: string
    admin: AdminCollectionConfig
    fields: Field[]
}


type AdminCollectionConfig = {
    group: string 
    description: string 
    useAsTitle: string
}

type Field = {
    type: FieldType 
    permissions: FieldPermissions
}

type FieldType = () => void

type FieldPermissions = {
    create?: string[]
    read?: string[]
    update?: string[]
    delete?: string[]
}