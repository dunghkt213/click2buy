import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private channels = new Map<string, Subject<any>>();

  private getOrCreate(userId: string): Subject<any> {
    let subject = this.channels.get(userId);

    if (!subject) {
      subject = new Subject<any>();
      this.channels.set(userId, subject);
    }

    return subject;
  }

  pushToUser(userId: string, event: any) {
    const subject = this.channels.get(userId);
    if (!subject) {
      console.warn(`⚠️ No SSE channel for user ${userId}`);
      return;
    }
    subject.next(event);
  }

  subscribe(userId: string): Observable<any> {
    return new Observable((subscriber) => {
      const subject = this.getOrCreate(userId);
      const sub = subject.subscribe(subscriber);

      return () => {
        console.log(`❌ SSE disconnected → cleanup ${userId}`);
        sub.unsubscribe();
        this.channels.delete(userId);
      };
    });
  }
}
