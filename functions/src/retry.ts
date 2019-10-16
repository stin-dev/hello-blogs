import { IEntry } from "./firestore/interface";
import { getImageUrlsFromEntry } from "./scraping";
import { firestore } from "./firestore/init";

interface RetryResult {
	success: boolean,
	message: string,
	urlCount: number,
}

export async function retryToGetImageUrls(entryId: string): Promise<RetryResult> {
	const querySnapshot = await firestore.collectionGroup("entries").where("entryId", "==", entryId).get();

	if (querySnapshot.size === 0) {
		console.warn(`entryId:${entryId}はFirestoreに存在しません。`);

		return {
			success: false,
			message: `entryId:${entryId}はFirestoreに存在しません。`,
			urlCount: 0,
		}
	}

	try {
		const entrySnapshot = querySnapshot.docs[0];

		const data = entrySnapshot.data();
		const entry: IEntry = {
			blogId: data.blogId,
			entryCreatedDatetime: data.entryCreatedDatetime,
			entryId: data.entryId,
			entryTitle: data.entryTitle,
			themeId: data.themeId,
			unitId: data.unitId,
		};

		const imageurls = await getImageUrlsFromEntry(entry, `https://ameblo.jp/${entry.blogId}`);

		console.info(`entryId:${entryId}からimageurlを${imageurls.length}件取得しました。`);

		const imageurlsCollection = entrySnapshot.ref.collection("imageurls");

		for (const imageurl of imageurls) {
			const imageurlDocRef = imageurlsCollection.doc(imageurl.imageurlId);

			console.log(`imageurlId:${imageurl.imageurlId}をドキュメントに登録します。`)
			await imageurlDocRef.set(imageurl);
		}

		return {
			success: true,
			message: `entryId:${entryId}からimageurlを${imageurls.length}件取得しました。`,
			urlCount: imageurls.length,
		};
	} catch (error) {
		return {
			success: false,
			message: "関数内部でエラーが発生しました。",
			urlCount: 0,
		}
	}
}
