export function formatDateTimeToPtBr(isoDate) {
    const date = new Date(isoDate);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  
  export function formatDateToPtBr(isoDate) {
    const date = new Date(isoDate);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
  
  export function getYear(isoDate) {
    const date = new Date(isoDate);
  
    const year = date.getFullYear();
  
    return `${year}`;
  }
  
  export function getMonth(isoDate) {
    const date = new Date(isoDate);
    
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
  
    return `${month}`;
  }
  
  export function getDay(isoDate) {
    const date = new Date(isoDate);
    
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${day}`;
  }