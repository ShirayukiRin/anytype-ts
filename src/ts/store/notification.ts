import { observable, action, computed, makeObservable } from 'mobx';
import { I, M } from 'Lib';

class NotificationStore {

    public itemList: I.Notification[] = [];

    constructor () {
        makeObservable(this, {
            itemList: observable,
            list: computed,
			add: action,
			delete: action,
        });
    };

    get list (): I.Notification[] {
		return this.itemList;
	};

	add (item: I.Notification): void {
		this.itemList.unshift(new M.Notification(item));
	};

	delete (id: string) {
		this.itemList = this.itemList.filter(it => it.id == id);
	};

};

 export const notificationStore: NotificationStore = new NotificationStore();
