import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import { VoiceMessage } from '../models/voice-message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // путь к XML-файлу:
  private xmlUrl = '/assets/data.xml';

  constructor(private http: HttpClient) {}

  // Загружаем и преобразуем XML в массив сообщений:
  getMessages(): Observable<VoiceMessage[]> {
    return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
      map(xmlString => {

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: ''
        });

        const parsed = parser.parse(xmlString);

        // console.log(parsed)

        const dataArray = Array.isArray(parsed.Root.Data)
          ? parsed.Root.Data
          : [parsed.Root.Data];

        return dataArray.map((data: any, index: number): VoiceMessage => {
          const filename = data.MIME?.MIME?.['Disposition-filename'] ?? 'vmail-2015-Sep-03_11-41.wav';

          return {
            id: `msg-${index}`,
            received: data.Received,
            from: data.From,
            to: data.To,
            date: data.Date,
            duration: Number(data.Duration),
            audioUrl: `assets/audio/${filename}`
          };
        });
      })
    );
  }
}
