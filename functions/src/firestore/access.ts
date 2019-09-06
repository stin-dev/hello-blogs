import { firestore } from "./init";

export class Blog {
	private id: string;
	private blog_id: number;
	private ameba_id: string;
	private unit_id: number;
	private last_entry_created_datetime: string;

	/**
	 * このBlogが保存されているFirestoreのDocument参照。
	 */
	private documentRef: FirebaseFirestore.DocumentReference;

	/**
	 * Firestoreで管理されるDocumentID
	 */
	get Id() { return this.id }

	/**
	 * BlogのID(GASの名残)
	 */
	get BlogId() { return this.blog_id }

	/**
	 * AmebaBlogのURLにもなるAmebaID
	 */
	get AmebaId() { return this.ameba_id }

	/**
	 * Blogを所持するUnitのID(GASの名残)
	 */
	get UnitId() { return this.unit_id }

	/**
	 * Blogの最終作成日時
	 */
	get LastEntryCreatedDatetime() { return this.last_entry_created_datetime }

	/**
	 * BlogのURL
	 */
	get BlogUrl() { return `https://ameblo.jp/${this.ameba_id}` }

	/**
	 * BlogのEntrylistのURL
	 */
	get EntrylistUrl() { return `${this.BlogUrl}/entrylist.html` }

	private constructor(
		id: string,
		blog_id: number,
		ameba_id: string,
		unit_id: number,
		documentRef: FirebaseFirestore.DocumentReference,
		last_entry_created_datetime?: string
	) {
		this.id = id;
		this.blog_id = blog_id;
		this.ameba_id = ameba_id;
		this.unit_id = unit_id;
		this.documentRef = documentRef;
		this.last_entry_created_datetime = last_entry_created_datetime ? last_entry_created_datetime : "2000-01-01T00:00:00.000+09:00";
	}

	/**
	 * num番目のEntrylistのURL
	 * @param num Entrylistのページ番号
	 */
	entrylistNthUrl(num: number) {
		if (num === 1) { return this.EntrylistUrl; }
		return `${this.BlogUrl}/entrylist-${num}.html`;
	}

	/**
	 * BlogにEntryを追加する。引数`entry`の`entry_created_datetime`が`LastEntryCreatedDatetime`以降の場合は
	 * 引数のデータをfirestoreに追加してtrueを返す。そうでなければFirestoreにアクセスすることなくfalseを返す。
	 * @param entry 
	 * @param imageurls 
	 * @param theme 
	 */
	async addEntry(entry: Entry, imageurls: ImageUrl[], theme: Theme): Promise<boolean> {
		if (!this.isLatest(entry.entry_created_datetime)) return false;

		console.info(`${entry.entry_id} を新規Entryとして登録します。`);

		const entryDocRef = this.documentRef.collection("entries").doc(String(entry.entry_id));
		const imageurlsCollRef = entryDocRef.collection("imageurls");
		const themeDocRef = this.documentRef.collection("themes").doc(String(theme.theme_id));

		await entryDocRef.set(entry);
		await themeDocRef.set(theme);

		for (let i = 0; i < imageurls.length; i++) {
			const imageurl = imageurls[i];
			const imageurlDocRef = imageurlsCollRef.doc(String(imageurl.image_id));

			await imageurlDocRef.set(imageurl);
		}

		return true;
	}

	isLatest(entryCreatedDatetime: string): boolean {
		return this.last_entry_created_datetime < entryCreatedDatetime;
	}

	/**
	 * Blogの最終更新日時を更新する。
	 * @param lastEntryCreatedDatetime 最終更新日時
	 */
	async setLastEntryCreatedDatetime(lastEntryCreatedDatetime: string) {
		await this.documentRef.set({
			last_entry_created_datetime: lastEntryCreatedDatetime,
		}, { merge: true });
	}

	/**
	 * Firestoreから取得したすべてのblogsドキュメントからBlogインスタンスを生成して配列として取得する。
	 */
	static async getAllBlogs(): Promise<Blog[]> {
		const blogsQuery = await firestore.collectionGroup("blogs").get();

		const blogs = blogsQuery.docs;

		return blogs.map(blog => {
			const data = blog.data();
			return new Blog(
				blog.id,
				data.blog_id,
				data.ameba_id,
				data.unit_id,
				blog.ref,
				data.last_entry_created_datetime,
			);
		});
	}

	static async getBlogAmebaId(amebaId: string): Promise<Blog> {
		const blogQuery = await firestore.collectionGroup("blogs").where("ameba_id", "==", amebaId).get();
		const blog = blogQuery.docs[0];
		const data = blog.data();

		return new Blog(
			blog.id,
			data.blog_id,
			data.ameba_id,
			data.unit_id,
			blog.ref,
			data.last_entry_created_datetime,
		);
	}
}

export interface Theme {
	blog_id: number,
	theme_id: number,
	theme_name: string,
}

export interface Entry {
	blog_id: number,
	entry_id: number,
	entry_title: string,
	theme_id: number,
	entry_created_datetime: string,
}

export interface ImageUrl {
	blog_id: number,
	entry_id: number,
	image_id: number,
	image_url: string,
}