import { Inject, Injectable } from '@nestjs/common';
import { app, auth, firestore } from 'firebase-admin';
import Auth = auth.Auth;
import { UserDto } from '../user/dto/user.dto';
import { CreateActivityDto } from '../day/dto/create-activity.dto';
import { formatToKey } from '../utils/time.util';
import dayjs from 'dayjs';
import Timestamp = firestore.Timestamp;
import { UpdateActivityDto } from '../day/dto/update-activity.dto';
import { DocNotFoundError } from '../exceptions/DocNotFoundError';

const COLLECTIONS = {
  USERS: 'users',
  DAYS: 'days',
  ACTIVITIES: 'activities',
} as const;

@Injectable()
export class FirebaseService {
  #db: FirebaseFirestore.Firestore;
  #users: FirebaseFirestore.CollectionReference;
  #auth: Auth;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
    this.#users = this.#db.collection(COLLECTIONS.USERS);
    this.#auth = firebaseApp.auth();
  }

  async getCurrentUser(userSessionId: string) {
    return await this.#auth.verifyIdToken(userSessionId);
  }

  async getActivities(user: UserDto, dates: string[]) {
    const userRef = await this.getUserRef(user);

    const days = await userRef
      .collection('days')
      .where('date', 'in', dates)
      .get();

    if (days.empty) {
      return [];
    }

    const activities = await userRef
      .collection(COLLECTIONS.ACTIVITIES)
      .where('day', 'in', dates)
      .get();

    return activities.docs.map((act) => act.data());
  }

  async saveActivity(
    user: UserDto,
    activity: CreateActivityDto,
  ): Promise<string> {
    const key = formatToKey(dayjs(activity.date));

    const userRef = await this.getUserRef(user);

    const dayCol = await userRef
      .collection(COLLECTIONS.DAYS)
      .where('date', '==', key)
      .get();

    if (dayCol.empty) {
      await userRef.collection(COLLECTIONS.DAYS).add({ date: key });
    } else {
      const dayDoc = dayCol.docs.at(0);
      const dayData = dayDoc?.data();
      if (dayData.completed) {
        await dayDoc.ref.set({ completed: false });
      }
    }

    const doc = await userRef
      .collection(COLLECTIONS.ACTIVITIES)
      .add({ ...activity, date: Timestamp.fromDate(activity.date.toDate()) });

    await doc.update({ id: doc.id });

    return doc.id;
  }

  async updateActivity(user: UserDto, activity: UpdateActivityDto) {
    const userRef = await this.getUserRef(user);

    const activityRef = await userRef
      .collection(COLLECTIONS.ACTIVITIES)
      .doc(activity.id)
      .get();

    if (!activityRef.exists) {
      throw new DocNotFoundError();
    }

    delete activity.date;

    await activityRef.ref.update({ ...activity });
  }

  private async getUserRef(user: UserDto) {
    return this.#users.doc(user.uid);
  }
}
