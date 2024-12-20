import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSize',
    standalone: false
})
export class FileSizePipe implements PipeTransform {

  transform(size: number, decimalPlaces: number = 2): string {
    if (isNaN(size) || size <= 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(decimalPlaces)) + ' ' + sizes[i];
  }
} 