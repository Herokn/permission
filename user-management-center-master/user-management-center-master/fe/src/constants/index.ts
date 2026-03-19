export enum ContentTypeEnum {
  Json = 'application/json',
  FormURLEncoded = 'application/x-www-form-urlencoded',
  FormData = 'multipart/form-data',
}

export const userStatusOptions = [
  {
    value: 0,
    label: 'PENDING',
  },
  {
    value: 1,
    label: 'ACTIVE',
  },
  {
    value: 2,
    label: 'DISABLED',
  },
  {
    value: 3,
    label: 'LEFT',
  },
]

export const userGenderOptions = [
  {
    value: 0,
    label: 'Unknown',
  },
  {
    value: 1,
    label: 'Male',
  },
  {
    value: 2,
    label: 'Female',
  },
]
