export function getUserTypeBadgeColor(userType: 'volunteer' | 'organization' | 'admin' | null): string {
  switch (userType) {
    case 'volunteer':
      return 'bg-blue-100 text-blue-700'
    case 'organization':
      return 'bg-green-100 text-green-700'
    case 'admin':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function getStatusColors(status: string): string {
  const statusColorMap: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }
  return statusColorMap[status] || 'bg-gray-100 text-gray-800'
}


