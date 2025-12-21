export const clearAllData = () => {
  if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    localStorage.removeItem('student-network-profile');
    localStorage.removeItem('student-network-rooms');
    localStorage.removeItem('student-network-icebreaker');
    window.location.reload();
  }
};

export const exportData = () => {
  const data = {
    profile: localStorage.getItem('student-network-profile'),
    rooms: localStorage.getItem('student-network-rooms'),
    icebreaker: localStorage.getItem('student-network-icebreaker')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-network-backup-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
