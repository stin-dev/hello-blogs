import fetch from "node-fetch";

/**
 * UrlFetchApp.fetch()を指定された試行回数だけ実行する。
 * 最初に成功したRequestのResponseからContentを返却する。
 * @param url URL
 * @param trials 試行回数
 * @param charset 文字コード
 */
export async function customFetch(url: string, trials: number): Promise<string> {
	let content = "";

	for (let i = 0; i < trials; i++) {
		const response = await fetch(url);
		if (response.ok) {
			content = await response.text();
			break;
		}
		else if (i < trials - 1) {
			console.warn(`${url}へのアクセス${i}回目失敗...`);
			continue;
		} else {
			console.error(`${url}へのアクセスが失敗しました。`);
			throw new Error(response.statusText);
		}
	}

	return content;
}