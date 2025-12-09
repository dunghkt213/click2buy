import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private channels = new Map<string, Subject<any>>();

  createChannel(userId: string): Subject<any> {
    if (!this.channels[userId]) {
      this.channels[userId] = new Subject<any>();
    }
    return this.channels[userId];
  }  

  pushToUser(userId: string, event: any) {
    const subject = this.channels.get(userId);
    if (subject) {
      subject.next(event);
    }
  }

  subscribe(userId: string): Observable<any> {
    return this.createChannel(userId).asObservable();
  }
}
