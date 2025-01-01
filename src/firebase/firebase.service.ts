import { Inject, Injectable } from '@nestjs/common';
import { app, auth, firestore } from 'firebase-admin';
import Auth = auth.Auth;
import { UserDto } from '../user/dto/user.dto';
import DocumentData = firestore.DocumentData;
import QuerySnapshot = firestore.QuerySnapshot;
import { CreateActivityDto } from '../day/dto/create-activity.dto';
import { formatToKey, fromKey } from '../utils/time.util';
import dayjs from 'dayjs';
import Timestamp = firestore.Timestamp;
import { UpdateActivityDto } from '../day/dto/update-activity.dto';
import { DocNotFoundError } from "../exceptions/DocNotFoundError";

@Injectable()
export class FirebaseService {
  #db: FirebaseFirestore.Firestore;
  #collection: FirebaseFirestore.CollectionReference;
  #auth: Auth;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
    this.#auth = firebaseApp.auth();
  }

  async getCurrentUser(userSessionId: string) {
    return await this.#auth.verifyIdToken(userSessionId);
  }

  async getActivities(user: UserDto, dates: string[]) {
    const days = await this.#db
      .collection(user.uid)
      .where('date', 'in', dates)
      .get();

    if (days.empty) {
      return [];
    }
    const activityRefs: Promise<QuerySnapshot<DocumentData, DocumentData>>[] =
      [];

    days.forEach((day) => {
      activityRefs.push(day.ref.collection('activities').get());
    });

    const result: DocumentData[] = [];

    for (const activityRef of activityRefs) {
      const activityCol = await activityRef;

      activityCol.docs.forEach((act) => {
        const data = act.data();
        result.push({ ...data, id: act.id });
      });
    }

    return result;
  }

  async saveActivity(
    user: UserDto,
    activity: CreateActivityDto,
  ): Promise<string> {
    const key = formatToKey(dayjs(activity.date));

    const dayCol = await this.#db.collection(user.uid).doc(key).get();

    if (!dayCol.exists) {
      await this.#db.collection(user.uid).doc(key).set({ date: key });
    }

    const doc = await this.#db
      .collection(user.uid)
      .doc(key)
      .collection('activities')
      .add({ ...activity, date: Timestamp.fromDate(activity.date.toDate()) });

    await doc.update({ id: doc.id });

    return doc.id;
  }

  async updateActivity(user: UserDto, activity: UpdateActivityDto) {
    const key = formatToKey(dayjs(activity.date));

    const activityRef = await this.#db
      .collection(user.uid)
      .doc(key)
      .collection('activities')
      .doc(activity.id)
      .get();

    if (!activityRef.exists) {
      throw new DocNotFoundError();
    }

    delete activity.date;

    await activityRef.ref.update({ ...activity });
  }
}
