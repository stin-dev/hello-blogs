export interface IUnit {
	/** FirestoreのDocumentID。 */
	unitId: string,

	/** ユニット名称。 */
	unitName: string,
}

export interface IBlog {
	/** FirestoreのDocumentID。 */
	blogId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** ブログタイトル。 */
	blogTitle: string,

	/** 下位のentriesの最終エントリー作成日時 */
	lastEntryCreatedDatetime:string,
}

export interface ITheme {
	/** FirestoreのDocumentID。 */
	themeId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** テーマ名称。 */
	themeName: string,
}

export interface IEntry {
	/** FirestoreのDocumentID。 */
	entryId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** 該当するthemesのDocumentID。 */
	themeId: string,

	/** エントリータイトル。 */
	entryTitle: string,

	/** エントリー作成日時。 */
	entryCreatedDatetime: string,
}

export interface IImageUrl {
	/** FirestoreのDocumentID。 */
	imageurlId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** 上位entriesのtheme_id。 */
	themeId: string,

	/** 上位entriesのDocumentID。 */
	entryId: string,

	/** 画像URL。 */
	imageUrl: string,

	/** 上位entriesのentry_created_datetime */
	entryCreatedDatetime: string,
}