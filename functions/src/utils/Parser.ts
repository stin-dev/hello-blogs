type fromtoType = { text: string, offset: number };

class Parser {
	private content: string;
	private direction: "from" | "to";
	private _from: fromtoType;
	private _to: fromtoType;
	private index?: number;
	private position: number;
	private end?: number;
	private last?: number;

	constructor(content: string) {
		this.content = content;
		this.direction = "from";
		this._from = { text: "", offset: 0 };
		this._to = { text: "", offset: 0 };
		this.index = 0;
		this.position = 0;
	}

	from(pattern: string, offset?: number): Parser {
		this._from.text = pattern;
		this._from.offset = offset || 0;
		return this;
	}

	to(pattern: string, offset?: number): Parser {
		this._to.text = pattern;
		this._to.offset = offset || 0;
		return this;
	}

	offset(index: number): Parser {
		this.index = index
		return this;
	}

	setDeirection(way: "from" | "to"): Parser {
		this.direction = way;
		return this;
	}

	build(): string {
		const txt = this.content;

		const obj = {
			from: this._from,
			to: this._to,
			index: this.index,
		};

		const keyword: { from?: number, to?: number } = {};

		if (this.direction === "from") {
			this.position = txt.indexOf(obj.from.text, obj.index);
			keyword.from = this.position + obj.from.offset + obj.from.text.length;
			keyword.to = txt.indexOf(obj.to.text, keyword.from + 1) + obj.to.offset;
		} else {
			keyword.to = txt.indexOf(obj.to.text) + obj.to.offset;
			keyword.from = txt.lastIndexOf(obj.from.text, keyword.to) + obj.from.offset + obj.from.text.length;
		}

		this.end = keyword.to;
		this.last = txt.lastIndexOf(obj.from.text);
		return txt.substring(keyword.from, keyword.to);
	}

	iterate(): string[] {
		const keywords = [];
		let start = true;

		while (start || this.last !== this.position) {
			const keyword = this.build();

			this.index = this.end;
			keywords.push(keyword);
			start = false;
		}
		return keywords;
	}
}

export function parse(content: string): Parser {
	return new Parser(content);
}