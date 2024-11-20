import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageSrc'
})
export class ImageSrcPipe implements PipeTransform {

  transform(file: File): string {
    if (!file) {
      return '';
    }
    return URL.createObjectURL(file);
  }
}