import { EXCEL_TYPE, FILE, FILE_EXT } from '@constant';

export const DownloadUtils = {
  downloadBase64Excel: (base64Data: string, fileName?: string) => {
    const byteCharacters = atob(base64Data);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: EXCEL_TYPE
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName || `${FILE}.${FILE_EXT.EXCEL}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  downloadBase64Pdf: (base64Data: string, fileName?: string) => {
    const byteCharacters = atob(base64Data);
    const byteArray = Uint8Array.from(byteCharacters, (char) => char.charCodeAt(0));
    const blob = new Blob([byteArray], {
      type: 'application/pdf'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName || `${FILE}.${FILE_EXT.PDF}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  downloadUrlImage: (dataUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName || `${FILE}.${FILE_EXT.PNG}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
