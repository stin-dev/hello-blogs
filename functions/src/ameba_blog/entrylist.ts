export interface EntryListState {
	archiveState: any,
	bloggerState: any,
	deviceState: any,
	entryState: {
		entryMap: {
			[entry_id: number]: EntryListItemState,
		},
		blogPageMap: any,
	},
	pcSidebarState: any,
	router: any,
	skinState: any,
	themesState: any,
}

interface EntryListItemState {
	entry_id: number;
	blog_id: number;
	theme_id: number;
	theme_name: string;
	user_id: number;
	entry_title: string;
	entry_last_editor_id: number;
	entry_created_datetime: string;
	ins_datetime: string;
	upd_datetime: string;
	last_edit_datetime: string;
}