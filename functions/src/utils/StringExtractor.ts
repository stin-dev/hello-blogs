class StringExtractor {
	private text: string;
	private targetString: string;
	private _from: string;
	private _to: string;

	constructor(text: string) {
		this.text = text;
		this.targetString = "";
		this._from = "";
		this._to = "";
	}

	target(target: string): StringExtractor {
		this.targetString = target;
		return this;
	}

	from(from: string): StringExtractor {
		this._from = from;
		return this;
	}

	to(to: string): StringExtractor {
		this._to = to;
		return this;
	}

	/**
	 * Targetが存在しない場合、空文字を返却する。
	 * 先頭からTargetまでにFromが存在しない場合、空文字を返却する。
	 * Targetから末尾までにToが存在しない場合、空文字を返却する。
	 */
	build(): string {
		const targetposition = this.text.indexOf(this.targetString);
		if (targetposition === -1) return "";

		const fromposition = this.text.lastIndexOf(this._from, targetposition);
		if (fromposition === -1) return "";

		const toposition = this.text.indexOf(this._to, targetposition);
		if (toposition === -1) return "";

		return this.text.substring(fromposition, toposition + this._to.length);
	}

	iterate(): string[] {
		const phrases: string[] = [];

		while(true) {
			const phrase = this.build();
			if (phrase === "") break;

			phrases.push(phrase);
			this.text =  this.text.substring(this.text.indexOf(phrase) + phrase.length);
		}

		return phrases;
	}
}

export default function extract(text:string):StringExtractor {
	return new StringExtractor(text);
}
