window.__ModuleLoader__.load({
	id: "dsh-better-left-sidebar",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/order.ts
		/** The state before the user changes anything. */
		const DEFAULT_SORTS = {
			pinned: {
				mode: "updated",
				order: []
			},
			recents: {
				mode: "updated",
				order: []
			}
		};
		/**
		* Order rows newest first.
		* @param ids - rows to order.
		* @param updatedAt - last update time of a row.
		* @returns a new array, newest first, with the row id as the tie-break.
		*/
		function byUpdated(ids, updatedAt) {
			return [...ids].sort((a, b) => updatedAt(b) - updatedAt(a) || a.localeCompare(b));
		}
		/**
		* Apply a saved order to the current rows. Rows that the saved order does not know go first, newest first.
		* @param ids - current rows.
		* @param saved - saved order; it can contain rows that no longer exist.
		* @param updatedAt - last update time of a row.
		* @returns a new array that contains each current row one time.
		*/
		function manualOrder(ids, saved, updatedAt) {
			const current = new Set(ids);
			const known = new Set(saved);
			return [...byUpdated(ids.filter((id) => !known.has(id)), updatedAt), ...[...known].filter((id) => current.has(id))];
		}
		/**
		* Move a row next to another row.
		* @param ids - rows in their shown order.
		* @param id - the row to move.
		* @param target - the row to move next to.
		* @param place - the side of the target.
		* @returns a new array; `ids` unchanged in content when `id` and `target` are the same row.
		*/
		function moveRow(ids, id, target, place) {
			if (id === target) return [...ids];
			const rest = ids.filter((row) => row !== id);
			const index = rest.indexOf(target);
			if (index < 0) return [...ids];
			rest.splice(place === "before" ? index : index + 1, 0, id);
			return rest;
		}
		function parseSection(value) {
			if (typeof value !== "object" || value === null) return void 0;
			const { mode, order } = value;
			if (mode !== "updated" && mode !== "manual" || !Array.isArray(order)) return void 0;
			return {
				mode,
				order: order.filter((id) => typeof id === "string")
			};
		}
		/**
		* Read sort state from its stored text.
		* @param text - stored JSON, or null when nothing is stored.
		* @returns the state; a damaged section gets its default.
		*/
		function parseSorts(text) {
			if (text === null) return DEFAULT_SORTS;
			let value;
			try {
				value = JSON.parse(text);
			} catch (error) {
				return DEFAULT_SORTS;
			}
			if (typeof value !== "object" || value === null) return DEFAULT_SORTS;
			const { pinned, recents } = value;
			return {
				pinned: parseSection(pinned) ?? DEFAULT_SORTS.pinned,
				recents: parseSection(recents) ?? DEFAULT_SORTS.recents
			};
		}
		//#endregion
		//#region src/client/classes.ts
		/**
		* Join class names and leave out the false values.
		* @param names - class names.
		* @returns the `className` value.
		*/
		function classes(...names) {
			return names.filter(Boolean).join(" ");
		}
		//#endregion
		//#region \0dsh-css:/Users/sonnd/Documents/test-haiku/dsh/local/plugins/dsh-better-left-sidebar/src/client/ConversationBrowser.module.css.mjs
		const css$1 = ".VlDQxa_root{flex-direction:column;flex:1;gap:2px;min-height:0;padding:2px 8px 0;display:flex}.VlDQxa_searchBox{box-sizing:border-box;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover);flex:none;align-items:center;gap:8px;height:32px;padding:0 4px 0 10px;display:flex}.VlDQxa_searchIcon{color:var(--dsw-alias-label-tertiary);flex:none}.VlDQxa_searchInput{min-width:0;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:0;outline:0;flex:1}.VlDQxa_searchInput::placeholder{color:var(--dsw-alias-label-tertiary)}.VlDQxa_newChat{border-radius:var(--dsw-radius-md);height:32px;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;flex:none;align-items:center;gap:8px;padding:0 10px;display:flex}.VlDQxa_newChatLabel{flex:1;min-width:0}.VlDQxa_newChatShortcut{visibility:hidden;color:var(--dsw-alias-label-tertiary)}.VlDQxa_newChat:hover .VlDQxa_newChatShortcut,.VlDQxa_newChat:focus-visible .VlDQxa_newChatShortcut{visibility:visible}.VlDQxa_scroll{scrollbar-gutter:stable;flex:1;min-height:0;margin-right:-8px;padding-right:8px;overflow-y:auto}.VlDQxa_section{margin-top:10px}.VlDQxa_sectionHeader{align-items:center;height:26px;padding:0 4px 0 10px;display:flex}.VlDQxa_sectionTitle{color:var(--dsw-alias-label-tertiary);flex:1;font-size:12px}.VlDQxa_sectionMenu{opacity:0;display:inline-flex}.VlDQxa_sectionHeader:hover .VlDQxa_sectionMenu,.VlDQxa_sectionMenu:focus-within,.VlDQxa_sectionMenuOpen{opacity:1}.VlDQxa_empty{color:var(--dsw-alias-label-tertiary);padding:4px 10px;font-size:13px}.VlDQxa_iconButton{border-radius:var(--dsw-radius-sm);width:22px;height:22px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.VlDQxa_row{box-sizing:border-box;border-radius:var(--dsw-radius-md);cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;min-height:32px;padding:0 6px 0 8px;display:flex;position:relative}.VlDQxa_selected,.VlDQxa_menuOpen{background:var(--dsw-alias-interactive-bg-hover)}.VlDQxa_dropBefore:before,.VlDQxa_dropAfter:before{background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:1px;height:2px;position:absolute;left:0;right:0}.VlDQxa_dropBefore:before{top:-1px}.VlDQxa_dropAfter:before{bottom:-1px}.VlDQxa_leading{width:16px;height:20px;color:var(--dsw-alias-label-tertiary);flex:none;justify-content:center;align-items:center;display:inline-flex}.VlDQxa_title{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;margin:0 6px;line-height:20px;overflow:hidden}.VlDQxa_snippet{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;font-size:12px;line-height:16px;display:block;overflow:hidden}.VlDQxa_resting{flex:none;align-items:center;gap:4px;display:inline-flex}.VlDQxa_time{color:var(--dsw-alias-label-tertiary);font-size:12px}.VlDQxa_actions{flex:none;align-items:center;gap:2px;display:none}.VlDQxa_menuOpen .VlDQxa_resting,.VlDQxa_row:focus-visible .VlDQxa_resting,.VlDQxa_row:has(:focus-visible) .VlDQxa_resting{display:none}.VlDQxa_menuOpen .VlDQxa_actions,.VlDQxa_row:focus-visible .VlDQxa_actions,.VlDQxa_row:has(:focus-visible) .VlDQxa_actions{display:inline-flex}@media (hover:hover){.VlDQxa_newChat:hover,.VlDQxa_row:hover{background:var(--dsw-alias-interactive-bg-hover)}.VlDQxa_iconButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.VlDQxa_row:hover .VlDQxa_resting{display:none}.VlDQxa_row:hover .VlDQxa_actions{display:inline-flex}}";
		const tagId$1 = "dsh-better-left-sidebar/ConversationBrowser.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-better-left-sidebar";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ConversationBrowser_module_css_default = {
			"actions": "VlDQxa_actions",
			"dropAfter": "VlDQxa_dropAfter",
			"dropBefore": "VlDQxa_dropBefore",
			"empty": "VlDQxa_empty",
			"iconButton": "VlDQxa_iconButton",
			"leading": "VlDQxa_leading",
			"menuOpen": "VlDQxa_menuOpen",
			"newChat": "VlDQxa_newChat",
			"newChatLabel": "VlDQxa_newChatLabel",
			"newChatShortcut": "VlDQxa_newChatShortcut",
			"resting": "VlDQxa_resting",
			"root": "VlDQxa_root",
			"row": "VlDQxa_row",
			"scroll": "VlDQxa_scroll",
			"searchBox": "VlDQxa_searchBox",
			"searchIcon": "VlDQxa_searchIcon",
			"searchInput": "VlDQxa_searchInput",
			"section": "VlDQxa_section",
			"sectionHeader": "VlDQxa_sectionHeader",
			"sectionMenu": "VlDQxa_sectionMenu",
			"sectionMenuOpen": "VlDQxa_sectionMenuOpen",
			"sectionTitle": "VlDQxa_sectionTitle",
			"selected": "VlDQxa_selected",
			"snippet": "VlDQxa_snippet",
			"time": "VlDQxa_time",
			"title": "VlDQxa_title"
		};
		//#endregion
		//#region src/client/ConversationBrowser.tsx
		/**
		* Conversation column with four sections in this order: search, new chat, pinned and recents. Pinned and recents each
		* sort by last update or by an order that the user makes by drag.
		* @module dsh-better-left-sidebar/client/ConversationBrowser
		*/
		const SEARCH_DEBOUNCE_MS = 250;
		/** The maximum length of the Host search query, in UTF-16 code units. */
		const SEARCH_QUERY_MAX = 500;
		/** Column slide time; an element that is not visible yet cannot take the focus. */
		const EXPAND_SLIDE_MS = 300;
		const CLOCK_INTERVAL_MS = 6e4;
		function compactTime(updatedAt, now, t) {
			const minutes = Math.floor((now - updatedAt) / 6e4);
			if (minutes < 1) return t("time.now");
			if (minutes < 60) return t("time.minutes", { n: minutes });
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return t("time.hours", { n: hours });
			const days = Math.floor(hours / 24);
			if (days < 30) return t("time.days", { n: days });
			const months = Math.floor(days / 30);
			return months < 12 ? t("time.months", { n: months }) : t("time.years", { n: Math.floor(months / 12) });
		}
		/** Accept the native drag in the whole document while a row moves, so the release does not animate as refused. */
		function useDragAcceptance(active) {
			(0, react.useEffect)(() => {
				if (!active) return;
				const accept = (event) => {
					event.preventDefault();
					if (event.dataTransfer !== null) event.dataTransfer.dropEffect = "move";
				};
				const drop = (event) => {
					event.preventDefault();
				};
				document.addEventListener("dragover", accept);
				document.addEventListener("drop", drop);
				return () => {
					document.removeEventListener("dragover", accept);
					document.removeEventListener("drop", drop);
				};
			}, [active]);
		}
		function rowHalf(event) {
			const rect = event.currentTarget.getBoundingClientRect();
			return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
		}
		function SessionRow({ row, selected, now, drag, t, renderSlot, openSessionMenu, useContextMenu, useContextMenuTarget, useSessionAccess, requestSessionRename, open }) {
			const { getTriggerProps } = useContextMenu();
			const menuOpen = useContextMenuTarget((target) => target?.kind === "session" && target.value.sessionId === row.id);
			const renamable = useSessionAccess(row.id, "session/rename");
			const renameArmed = (0, react.useRef)(false);
			const opened = () => {
				open(row.id);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: classes(ConversationBrowser_module_css_default.row, selected && ConversationBrowser_module_css_default.selected, menuOpen && ConversationBrowser_module_css_default.menuOpen, drag?.marker === "before" && ConversationBrowser_module_css_default.dropBefore, drag?.marker === "after" && ConversationBrowser_module_css_default.dropAfter),
				role: "treeitem",
				"aria-selected": selected,
				tabIndex: 0,
				"data-row-id": row.id,
				onClick: opened,
				...getTriggerProps({
					kind: "session",
					value: {
						sessionId: row.id,
						displayTitle: row.title
					}
				}, { onKeyDown: (event) => {
					if (event.target !== event.currentTarget || event.key !== "Enter" && event.key !== " ") return;
					event.preventDefault();
					opened();
				} }),
				draggable: drag !== void 0,
				onDragStart: drag === void 0 ? void 0 : (event) => {
					event.dataTransfer.effectAllowed = "move";
					event.dataTransfer.setData("text/plain", row.id);
					drag.start();
				},
				onDragEnd: drag?.end,
				onDragOver: drag === void 0 ? void 0 : (event) => {
					if (!drag.active) return;
					event.preventDefault();
					drag.hover(rowHalf(event));
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: ConversationBrowser_module_css_default.leading,
						children: row.state === "idle" ? renderSlot("sidebar.session.row.leading", { sessionId: row.id }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: row.state })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ConversationBrowser_module_css_default.title,
						onMouseDown: (event) => {
							if (event.detail === 1) renameArmed.current = true;
						},
						onDoubleClick: !renamable ? void 0 : (event) => {
							event.stopPropagation();
							if (!renameArmed.current) return;
							renameArmed.current = false;
							requestSessionRename(row.id, row.title);
						},
						children: [row.title, row.snippet !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ConversationBrowser_module_css_default.snippet,
							children: row.snippet
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ConversationBrowser_module_css_default.resting,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ConversationBrowser_module_css_default.time,
							children: compactTime(row.updatedAt, now, t)
						}), renderSlot("sidebar.session.row.trailing", { sessionId: row.id })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ConversationBrowser_module_css_default.actions,
						onClick: (event) => {
							event.stopPropagation();
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ConversationBrowser_module_css_default.iconButton,
							"aria-label": t("row.actions", { name: row.title }),
							"data-context-menu-trigger": "",
							onPointerDown: (event) => {
								event.stopPropagation();
							},
							onClick: (event) => {
								const rect = event.currentTarget.getBoundingClientRect();
								openSessionMenu(row.id, row.title, {
									x: rect.left,
									y: rect.bottom
								}, "toggle");
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, { size: 14 })
						}), renderSlot("sidebar.workspaces.session.row.action", {
							sessionId: row.id,
							displayTitle: row.title
						})]
					})
				]
			});
		}
		function SortMenu({ name, mode, onPick, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: classes(ConversationBrowser_module_css_default.sectionMenu, open && ConversationBrowser_module_css_default.sectionMenuOpen),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: () => {
						setOpen(false);
					},
					portal: true,
					align: "end",
					autoFocus: true,
					selectedId: mode,
					items: [{
						id: "updated",
						label: t("sort.updated")
					}, {
						id: "manual",
						label: t("sort.manual")
					}],
					onSelect: (id) => {
						setOpen(false);
						onPick(id);
					},
					anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ConversationBrowser_module_css_default.iconButton,
						"aria-label": t("section.options", { name }),
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, { size: 14 })
					})
				})
			});
		}
		function Section({ id, title, empty, rows, store, currentId, now, t, slots }) {
			const sort = (0, react.useSyncExternalStore)(store.subscribe, store.getSnapshot)[id];
			const byId = (0, react.useMemo)(() => new Map(rows.map((row) => [row.id, row])), [rows]);
			const updatedAt = (rowId) => byId.get(rowId)?.updatedAt ?? 0;
			const ids = rows.map((row) => row.id);
			const ordered = sort.mode === "manual" ? manualOrder(ids, sort.order, updatedAt) : byUpdated(ids, updatedAt);
			const [drag, setDrag] = (0, react.useState)(null);
			useDragAcceptance(drag !== null);
			const manual = sort.mode === "manual";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: ConversationBrowser_module_css_default.section,
				"aria-label": title,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: ConversationBrowser_module_css_default.sectionHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ConversationBrowser_module_css_default.sectionTitle,
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SortMenu, {
							name: title,
							mode: sort.mode,
							t,
							onPick: (mode) => {
								store.setMode(id, mode, ordered);
							}
						})]
					}),
					ordered.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ConversationBrowser_module_css_default.empty,
						children: empty
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						role: "tree",
						"aria-label": title,
						children: ordered.map((rowId) => {
							const row = byId.get(rowId);
							if (row === void 0) return null;
							const rowDrag = !manual ? void 0 : {
								active: drag !== null,
								marker: drag?.over?.id === rowId && drag.id !== rowId ? drag.over.place : void 0,
								start: () => {
									setDrag({ id: rowId });
								},
								hover: (place) => {
									setDrag((value) => value === null ? value : {
										id: value.id,
										over: {
											id: rowId,
											place
										}
									});
								},
								end: () => {
									if (drag?.over !== void 0) store.setOrder(id, moveRow(ordered, drag.id, drag.over.id, drag.over.place));
									setDrag(null);
								}
							};
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRow, {
								...slots,
								row,
								selected: rowId === currentId,
								now,
								drag: rowDrag,
								t
							}, rowId);
						})
					})
				]
			});
		}
		function statesOf(useSessionStatus) {
			const statuses = useSessionStatus((snapshot) => snapshot);
			return (id, running) => {
				const status = statuses.get(id);
				if (status?.pendingInteraction !== void 0) return "warning";
				if (status?.running ?? running) return "ongoing";
				return status?.completionUnread === true ? "done" : "idle";
			};
		}
		function titleOf(session, t) {
			const title = session.displayTitle ?? session.title ?? "";
			return title === "" ? t("row.untitled") : title;
		}
		/**
		* Create the column component for one sort store.
		* @param store - sort state of the sections.
		* @param openChat - receives the chat that the main view shows.
		* @returns the component for the `sidebar.workspaces` slot.
		*/
		function createConversationBrowser(store, openChat) {
			return function ConversationBrowser(props) {
				const { wide, expandSidebar, useSessions, useWorkspaces, usePanelInfo, useSessionStatus, useRemoteAccess, useShortcuts, useWorkspaceShortcuts, startSession, searchSessions, searchResultLimit, t } = props;
				const list = useSessions((state) => state);
				const archivedIds = useWorkspaces((state) => state.archivedSessionIds);
				const pinnedIds = useWorkspaces((state) => state.pinnedSessionIds);
				const panelActive = usePanelInfo((info) => info.activePanelId !== null);
				const canStart = useRemoteAccess("session/create");
				const newShortcut = useShortcuts((rows) => rows.find((row) => row.id === "session.new"));
				const searchRequest = useWorkspaceShortcuts((state) => state.searchRequest);
				const stateOf = statesOf(useSessionStatus);
				const [now, setNow] = (0, react.useState)(() => Date.now());
				(0, react.useEffect)(() => {
					const timer = window.setInterval(() => {
						setNow(Date.now());
					}, CLOCK_INTERVAL_MS);
					return () => {
						window.clearInterval(timer);
					};
				}, []);
				const [query, setQuery] = (0, react.useState)("");
				const [content, setContent] = (0, react.useState)({
					query: "",
					items: [],
					pending: false
				});
				const input = (0, react.useRef)(null);
				const normalized = query.slice(0, SEARCH_QUERY_MAX).trim();
				(0, react.useEffect)(() => {
					if (normalized === "") return;
					const controller = new AbortController();
					setContent({
						query: normalized,
						items: [],
						pending: true
					});
					const timer = window.setTimeout(() => {
						searchSessions(normalized, controller.signal).then((result) => {
							if (!controller.signal.aborted) setContent({
								query: normalized,
								items: result.items,
								pending: false
							});
						}).catch(() => {
							if (!controller.signal.aborted) setContent({
								query: normalized,
								items: [],
								pending: false
							});
						});
					}, SEARCH_DEBOUNCE_MS);
					return () => {
						window.clearTimeout(timer);
						controller.abort();
					};
				}, [normalized, searchSessions]);
				const lastSearchRequest = (0, react.useRef)(searchRequest);
				(0, react.useEffect)(() => {
					if (lastSearchRequest.current === searchRequest) return;
					lastSearchRequest.current = searchRequest;
					if (wide) {
						input.current?.focus();
						return;
					}
					expandSidebar();
					const timer = window.setTimeout(() => {
						input.current?.focus();
					}, EXPAND_SLIDE_MS);
					return () => {
						window.clearTimeout(timer);
					};
				}, [
					searchRequest,
					wide,
					expandSidebar
				]);
				const archived = new Set(archivedIds);
				const pinned = new Set(pinnedIds);
				const sessions = list.byId;
				const visible = list.ids.filter((id) => {
					const session = sessions[id];
					return session !== void 0 && !session.blank && !archived.has(id);
				});
				const modelOf = (id, snippet) => {
					const session = sessions[id];
					if (session === void 0) return void 0;
					return {
						id,
						title: titleOf(session, t),
						updatedAt: session.updatedAt,
						state: stateOf(id, session.running),
						snippet
					};
				};
				const models = (ids) => ids.flatMap((id) => {
					const model = modelOf(id);
					return model === void 0 ? [] : [model];
				});
				const currentId = panelActive ? void 0 : Object.values(list.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id;
				const openRow = currentId !== void 0 && visible.includes(currentId) ? modelOf(currentId) : void 0;
				const openId = openRow?.id;
				const openTitle = openRow?.title;
				(0, react.useEffect)(() => {
					openChat.current = openId === void 0 || openTitle === void 0 ? void 0 : {
						id: openId,
						title: openTitle
					};
				}, [openId, openTitle]);
				const slots = {
					renderSlot: props.renderSlot,
					openSessionMenu: props.openSessionMenu,
					useContextMenu: props.useContextMenu,
					useContextMenuTarget: props.useContextMenuTarget,
					useSessionAccess: props.useSessionAccess,
					requestSessionRename: props.requestSessionRename,
					open: props.open
				};
				const searching = normalized !== "";
				const needle = normalized.toLocaleLowerCase();
				const titleMatches = !searching ? [] : visible.filter((id) => titleOf(sessions[id], t).toLocaleLowerCase().includes(needle));
				const titleSet = new Set(titleMatches);
				const contentItems = content.query === normalized ? content.items : [];
				const searchRows = !searching ? [] : [...models(titleMatches), ...contentItems.flatMap((item) => {
					if (titleSet.has(item.sessionId) || archived.has(item.sessionId)) return [];
					const model = modelOf(item.sessionId, item.snippet);
					return model === void 0 ? [] : [model];
				})].slice(0, searchResultLimit);
				const searchPending = searching && (content.query !== normalized || content.pending);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ConversationBrowser_module_css_default.root,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ConversationBrowser_module_css_default.searchBox,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineMedium, {
									size: 14,
									className: ConversationBrowser_module_css_default.searchIcon
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									ref: input,
									className: ConversationBrowser_module_css_default.searchInput,
									value: query,
									maxLength: SEARCH_QUERY_MAX,
									placeholder: t("search.placeholder"),
									"aria-label": t("search.placeholder"),
									onChange: (event) => {
										setQuery(event.target.value);
									},
									onKeyDown: (event) => {
										if (event.key === "Escape") setQuery("");
									}
								}),
								query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ConversationBrowser_module_css_default.iconButton,
									"aria-label": t("search.clear"),
									onClick: () => {
										setQuery("");
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
								})
							]
						}),
						canStart && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ConversationBrowser_module_css_default.newChat,
							"aria-keyshortcuts": newShortcut?.aria,
							onClick: () => {
								startSession();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutlineMedium, { size: 14 }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ConversationBrowser_module_css_default.newChatLabel,
									children: t("newChat")
								}),
								newShortcut !== void 0 && newShortcut.keys.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ConversationBrowser_module_css_default.newChatShortcut,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, { keys: newShortcut.keys })
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ConversationBrowser_module_css_default.scroll,
							children: searching ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								role: "tree",
								"aria-label": t("search.placeholder"),
								children: [searchRows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRow, {
									...slots,
									row,
									selected: row.id === currentId,
									now,
									t
								}, row.id)), searchRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: ConversationBrowser_module_css_default.empty,
									children: t(searchPending ? "search.pending" : "search.none")
								})]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								id: "pinned",
								title: t("section.pinned"),
								empty: t("section.pinned.empty"),
								rows: models(visible.filter((id) => pinned.has(id))),
								store,
								currentId,
								now,
								t,
								slots
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
								id: "recents",
								title: t("section.recents"),
								empty: t("section.recents.empty"),
								rows: models(visible.filter((id) => !pinned.has(id))),
								store,
								currentId,
								now,
								t,
								slots
							})] })
						})
					]
				});
			};
		}
		//#endregion
		//#region src/client/ledger.ts
		/**
		* Replaces a shipped single-slot entry without changing it. The plugin registers a second entry at a lower priority,
		* which the renderer selects. DSH does not have a published way to do this, so this module reads the slot ledger.
		* @module dsh-better-left-sidebar/client/ledger
		*/
		/** Priority of the replacement entries; the renderer selects the lowest number. */
		const SHADOW_PRIORITY = -100;
		/**
		* Give the replacement entry the child slots of the shipped entry.
		*
		* The ledger refuses a second declaration of a child slot, and it releases each child that it can list when an entry
		* goes away. The shipped entry owns these children, so the ledger must not list them for the replacement. The table is
		* not enumerable for that reason. The renderer and other plugins read a child by its key, so they still find it.
		* A chain or session child needs an enumerable table; the sidebar slots have none.
		* @param shipped - child table of the shipped entry.
		* @returns the table to register.
		*/
		function unlistedChildren(shipped) {
			const table = {};
			for (const key of Object.keys(shipped)) Object.defineProperty(table, key, {
				value: shipped[key],
				enumerable: false
			});
			return table;
		}
		/**
		* Show `component` in a single slot instead of its shipped entry, and follow that entry when it is registered again.
		* @param slots - the slot ledger.
		* @param name - slot name.
		* @param component - the replacement component. It gets the props of the shipped entry.
		* @param locale - dictionary namespace of its `t` prop; the namespace of the shipped entry when undefined.
		* @returns a function that removes the replacement.
		*/
		function shadowSlot(slots, name, component, locale) {
			let source;
			let dispose;
			let busy = false;
			const remove = () => {
				dispose?.();
				dispose = void 0;
				source = void 0;
			};
			const sync = () => {
				if (busy) return;
				const shipped = slots.entries(name).find((entry) => (entry.options?.priority ?? 0) > SHADOW_PRIORITY);
				if (shipped === source) return;
				busy = true;
				try {
					remove();
					if (shipped === void 0) return;
					const resolvedLocale = locale ?? shipped.locale;
					dispose = slots.register({
						name,
						priority: SHADOW_PRIORITY,
						children: unlistedChildren(shipped.children ?? {}),
						...shipped.inject === void 0 ? {} : { inject: shipped.inject },
						...shipped.store === void 0 ? {} : { store: shipped.store },
						...resolvedLocale === void 0 ? {} : { locale: resolvedLocale }
					}, component);
					source = shipped;
				} finally {
					busy = false;
				}
			};
			const unsubscribe = slots.subscribe(name, sync);
			sync();
			return () => {
				unsubscribe();
				remove();
			};
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* Text of the conversation column.
		* @module dsh-better-left-sidebar/client/locales
		*/
		/** English dictionary. */
		const en = {
			"search.placeholder": "Search chats",
			"search.clear": "Clear search",
			"search.none": "No matching chats",
			"search.pending": "Searching",
			"newChat": "New chat",
			"section.pinned": "Pinned",
			"section.recents": "Recents",
			"section.options": "{name} options",
			"section.pinned.empty": "No pinned chats",
			"section.recents.empty": "No chats yet",
			"sort.updated": "Last updated",
			"sort.manual": "Manual order",
			"row.untitled": "New chat",
			"row.actions": "Actions for {name}",
			"shortcut.pin": "Pin or unpin chat",
			"shortcut.noChat": "Open a chat first",
			"time.now": "now",
			"time.minutes": "{n}m",
			"time.hours": "{n}h",
			"time.days": "{n}d",
			"time.months": "{n}mo",
			"time.years": "{n}y"
		};
		/** Chinese dictionary. */
		const zh = {
			"search.placeholder": "搜索对话",
			"search.clear": "清除搜索",
			"search.none": "没有匹配的对话",
			"search.pending": "正在搜索",
			"newChat": "新对话",
			"section.pinned": "已置顶",
			"section.recents": "最近",
			"section.options": "{name} 选项",
			"section.pinned.empty": "没有置顶的对话",
			"section.recents.empty": "还没有对话",
			"sort.updated": "最后更新",
			"sort.manual": "手动排序",
			"row.untitled": "新对话",
			"row.actions": "{name} 的操作",
			"shortcut.pin": "置顶或取消置顶对话",
			"shortcut.noChat": "请先打开一个对话",
			"time.now": "刚刚",
			"time.minutes": "{n}分钟",
			"time.hours": "{n}小时",
			"time.days": "{n}天",
			"time.months": "{n}个月",
			"time.years": "{n}年"
		};
		//#endregion
		//#region src/client/pin-shortcut.ts
		/**
		* Keyboard command that pins or unpins the open chat. It runs the Pin action of the row menu, so the plugin that owns
		* a chat decides how to pin it.
		* @module dsh-better-left-sidebar/client/pin-shortcut
		*/
		/** Row id prefix and menu target kind of the Claude and Codex chats of dsh-agent-bridge. */
		const EXTERNAL_PREFIX = "ext:";
		const EXTERNAL_MENU_KIND = "agent-bridge.session";
		const NATIVE_MENU_KIND = "session";
		const PIN_ACTION_SUFFIX = "/pin";
		const COMMAND_ID = "better-left-sidebar.pin";
		/** The native command that has Cmd+P as its default. */
		const FILES_COMMAND_ID = "workspace.files";
		/** The preference revision moves while commands register, so a save can be stale. */
		const STALE_RETRIES = 3;
		/** A browser keeps Cmd+P for print, so a browser page uses the second binding. */
		const KEY_CANDIDATES = [{
			code: "KeyP",
			modifiers: ["primary"]
		}, {
			code: "KeyP",
			modifiers: ["primary", "alt"]
		}];
		/**
		* Run the Pin or Unpin action of a chat.
		* @param menus - the context menu service.
		* @param chat - the chat to change.
		* @returns a promise that settles after the action started; it does nothing when the chat has no enabled action.
		*/
		async function togglePin(menus, chat) {
			const resolution = menus.resolve({
				kind: chat.id.startsWith(EXTERNAL_PREFIX) ? EXTERNAL_MENU_KIND : NATIVE_MENU_KIND,
				value: {
					sessionId: chat.id,
					displayTitle: chat.title
				}
			});
			try {
				await resolution.ready;
				const action = resolution.source.getSnapshot().find((item) => item.id.endsWith(PIN_ACTION_SUFFIX) && item.disabled !== true);
				if (action !== void 0) resolution.select(action.id);
			} finally {
				resolution.dispose();
			}
		}
		/**
		* Save one preference edit, and save again with the newest revision when the store reports a stale revision.
		* @param shortcuts - the shortcut service.
		* @param edit - the preference edit.
		* @param revision - the accepted preference revision.
		* @returns the result of the last save.
		*/
		async function saveEdit(shortcuts, edit, revision) {
			let result = await shortcuts.edit(edit, revision);
			for (let attempt = 0; result.status === "stale" && attempt < STALE_RETRIES; attempt += 1) result = await shortcuts.edit(edit, result.snapshot.revision);
			return result;
		}
		/**
		* Save the key of the command. The store refuses a key that disables a default of another command, so a refusal that
		* names the Files command clears that default and saves again.
		* @param shortcuts - the shortcut service.
		* @param binding - the key to save.
		* @param revision - the accepted preference revision.
		*/
		async function saveKey(shortcuts, binding, revision) {
			const edit = {
				type: "set",
				id: COMMAND_ID,
				binding
			};
			const first = await saveEdit(shortcuts, edit, revision);
			if (first.status !== "conflict" || first.conflicts?.includes(FILES_COMMAND_ID) !== true) return;
			const cleared = await saveEdit(shortcuts, {
				type: "set",
				id: FILES_COMMAND_ID,
				binding: null
			}, first.snapshot.revision);
			if (cleared.status === "saved") await saveEdit(shortcuts, edit, cleared.snapshot.revision);
		}
		/**
		* Give the command its key one time. The native Files command has Cmd+P as a default, and the registry refuses a second
		* default on the same key, so the key is saved as a preference. The check for a saved preference keeps a key that the
		* user selected later.
		* @param shortcuts - the shortcut service.
		* @returns a function that stops the wait for the preferences.
		*/
		function claimKey(shortcuts) {
			let claimed = false;
			const attempt = () => {
				if (claimed) return;
				const config = shortcuts.config.getSnapshot();
				const row = shortcuts.catalog.getSnapshot().find((entry) => entry.id === COMMAND_ID);
				if (config.status !== "ready" || row === void 0) return;
				claimed = true;
				if (row.modified) return;
				const binding = KEY_CANDIDATES.find((candidate) => shortcuts.describeBinding(candidate).issue === null);
				if (binding === void 0) return;
				saveKey(shortcuts, binding, config.revision).catch((error) => {
					console.error("better-left-sidebar: could not save the pin shortcut", error);
				});
			};
			const stopConfig = shortcuts.config.subscribe(attempt);
			const stopCatalog = shortcuts.catalog.subscribe(attempt);
			attempt();
			return () => {
				stopConfig();
				stopCatalog();
			};
		}
		/**
		* Register the command.
		* @param shortcuts - the shortcut service.
		* @param menus - the context menu service.
		* @param chat - the open chat.
		* @param text - the command label and the reason that shows when no chat is open.
		* @returns a function that removes the command.
		*/
		function registerPinShortcut(shortcuts, menus, chat, text) {
			const unregister = shortcuts.register({
				id: COMMAND_ID,
				label: text.label,
				aliases: ["pin chat", "unpin chat"],
				defaults: {},
				regions: ["page", "editable"],
				modals: ["sidebar"],
				resolve: () => {
					const open = chat.current;
					if (open === void 0) return {
						status: "blocked",
						reason: text.noChat()
					};
					return {
						status: "handled",
						run: () => togglePin(menus, open)
					};
				}
			});
			const stopClaim = claimKey(shortcuts);
			return () => {
				stopClaim();
				unregister();
			};
		}
		//#endregion
		//#region \0dsh-css:/Users/sonnd/Documents/test-haiku/dsh/local/plugins/dsh-better-left-sidebar/src/client/RailShell.module.css.mjs
		const css = ".k1oKSq_root{--dsh-sidebar-inline-padding:8px;--dsh-sidebar-row-padding:12px;--dsh-sidebar-label-gap:6px;--dsh-sidebar-paint-inset:3px;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);box-sizing:border-box;background:var(--dsw-specific-sidebar-fill);height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;font-size:14px;display:flex}.k1oKSq_root:not(:hover){--dsh-scrollbar-thumb:transparent;--dsh-scrollbar-thumb-hover:transparent}[data-animating]:not([data-dragging]) .k1oKSq_root{transition:width var(--ds-transition-duration-slow) var(--ds-ease-in-out)}[data-platform=darwin] .k1oKSq_root{background:0 0}.k1oKSq_collapsed{width:100%}.k1oKSq_fading .k1oKSq_main{opacity:0;transition:opacity .15s var(--ds-ease-in-out)}.k1oKSq_topStrip{box-sizing:border-box;flex:none;justify-content:flex-end;align-items:center;height:52px;padding:0 8px 2px;display:flex}[data-fullscreen] .k1oKSq_topStrip{justify-content:flex-start}.k1oKSq_body{flex:1;min-height:0;display:flex}.k1oKSq_rail{box-sizing:border-box;border-right:1px solid var(--dsw-alias-border-l2);flex-direction:column;flex:none;align-items:center;gap:6px;width:48px;padding:2px 0 10px;display:flex}.k1oKSq_collapsed .k1oKSq_rail{border-right:0;width:100%}.k1oKSq_brand{flex:none;justify-content:center;align-items:center;width:34px;height:34px;display:inline-flex}.k1oKSq_railSpacer{flex:1}.k1oKSq_toggle,.k1oKSq_railButton{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;flex:none;justify-content:center;align-items:center;display:inline-flex}.k1oKSq_toggle{border-radius:var(--dsw-radius-sm);width:28px;height:28px}.k1oKSq_railButton{border-radius:var(--dsw-radius-md);width:34px;height:34px}.k1oKSq_railActive{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.k1oKSq_railUpdate{corner-shape:round;background:var(--dsw-alias-brand-primary-new-colorprimary-new-color);color:#fff;cursor:pointer;border:0;border-radius:50%;flex:none;justify-content:center;align-items:center;width:32px;height:32px;display:inline-flex}.k1oKSq_railUpdate[aria-disabled=true]{cursor:default}.k1oKSq_railSpinner{animation:1s linear infinite k1oKSq_rail-spin}@keyframes k1oKSq_rail-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.k1oKSq_railSpinner{animation:none}}@media (hover:hover){.k1oKSq_toggle:hover,.k1oKSq_railButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}.k1oKSq_main{flex-direction:column;flex:1;min-width:0;display:flex}.k1oKSq_collapsed .k1oKSq_main{display:none}";
		const tagId = "dsh-better-left-sidebar/RailShell.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-better-left-sidebar";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var RailShell_module_css_default = {
			"body": "k1oKSq_body",
			"brand": "k1oKSq_brand",
			"collapsed": "k1oKSq_collapsed",
			"fading": "k1oKSq_fading",
			"main": "k1oKSq_main",
			"rail": "k1oKSq_rail",
			"rail-spin": "k1oKSq_rail-spin",
			"railActive": "k1oKSq_railActive",
			"railButton": "k1oKSq_railButton",
			"railSpacer": "k1oKSq_railSpacer",
			"railSpinner": "k1oKSq_railSpinner",
			"railUpdate": "k1oKSq_railUpdate",
			"root": "k1oKSq_root",
			"toggle": "k1oKSq_toggle",
			"topStrip": "k1oKSq_topStrip"
		};
		//#endregion
		//#region src/client/RailFooter.tsx
		/**
		* Update and settings buttons of the rail. In its narrow form the native footer hides the update button and keeps
		* Settings inside the account menu, so this component reads both from the `sidebar.settings` ledger entry.
		* @module dsh-better-left-sidebar/client/RailFooter
		*/
		const SETTINGS_SLOT = "sidebar.settings";
		const LAUNCHER_SLOT = "settings.launcher";
		const BUSY_PHASES = new Set([
			"checking",
			"downloading",
			"verifying",
			"installing"
		]);
		const NO_UPDATE = {
			failed: false,
			opening: false
		};
		const noUpdates = {
			getSnapshot: () => NO_UPDATE,
			subscribe: () => () => {}
		};
		function settingsFace(entry) {
			return typeof entry?.inject === "function" ? entry.inject() : {};
		}
		function updateLabel({ presentation, failed }, t) {
			if (failed || presentation === void 0 || presentation.phase === "error") return t("desktop.update.retry");
			const label = presentation.phase === "downloading" ? t("desktop.update.progress", { percent: presentation.percent ?? 0 }) : t(`desktop.update.${presentation.phase}`);
			return presentation.version === void 0 ? label : t("desktop.update.versionDetail", {
				label,
				version: presentation.version
			});
		}
		/**
		* Create the footer buttons.
		* @param slots - the slot ledger.
		* @param t - translator of the native `settings` dictionary.
		* @returns the component that shows the buttons.
		*/
		function createRailFooter(slots, t) {
			const subscribeSettings = (listener) => slots.subscribe(SETTINGS_SLOT, listener);
			const subscribeLauncher = (listener) => slots.subscribe(LAUNCHER_SLOT, listener);
			const settingsEntry = () => slots.entries(SETTINGS_SLOT)[0];
			const hasLauncher = () => slots.entries(LAUNCHER_SLOT).length > 0;
			return function RailFooter() {
				const entry = (0, react.useSyncExternalStore)(subscribeSettings, settingsEntry);
				const showGear = (0, react.useSyncExternalStore)(subscribeLauncher, hasLauncher);
				const face = (0, react.useMemo)(() => settingsFace(entry), [entry]);
				const source = face.hooks?.desktopUpdate ?? noUpdates;
				const update = (0, react.useSyncExternalStore)(source.subscribe, source.getSnapshot);
				const phase = update.presentation?.phase;
				const showUpdate = update.failed || phase !== void 0 && phase !== "idle";
				const busy = update.opening || phase !== void 0 && BUSY_PHASES.has(phase);
				const openSettings = () => {
					(entry?.store)?.create?.().actions.open();
				};
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [showUpdate && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: updateLabel(update, t),
					delayMs: 500,
					side: "right",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: RailShell_module_css_default.railUpdate,
						"aria-label": updateLabel(update, t),
						"aria-disabled": busy,
						onClick: () => {
							if (!busy) face.openDesktopUpdate?.();
						},
						children: busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutlineRegular, {
							className: RailShell_module_css_default.railSpinner,
							size: 18
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 18 })
					})
				}), showGear && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("trigger"),
					delayMs: 500,
					side: "right",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: RailShell_module_css_default.railButton,
						"aria-label": t("trigger"),
						"aria-haspopup": "dialog",
						onClick: openSettings,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: 18 })
					})
				})] });
			};
		}
		//#endregion
		//#region src/client/RailShell.tsx
		/**
		* Sidebar shell: a small icon rail and, beside it, the conversation column. The native shell puts the panel rows
		* above the session list. This shell moves them, the settings and the footer actions into the rail.
		* @module dsh-better-left-sidebar/client/RailShell
		*/
		/** Time after a collapse before the wide content leaves; the same as the native shell. */
		const COLLAPSE_SETTLE_MS = 150;
		/** The native panel that the More menu cannot hide. */
		const FIXED_PANEL_ID = "plugins";
		const RAIL_ICON_SIZE = 18;
		/** One panel button. Each button reads only its own selection state. */
		function RailPanel({ id, label, usePanelInfo, selectPanel, renderSlot }) {
			const active = usePanelInfo((info) => info.activePanelId === id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				delayMs: 500,
				side: "right",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: classes(RailShell_module_css_default.railButton, active && RailShell_module_css_default.railActive),
					"aria-label": label,
					"aria-current": active ? "page" : void 0,
					onClick: () => {
						selectPanel(id);
					},
					children: renderSlot("sidebar.panellist", {
						size: RAIL_ICON_SIZE,
						active
					}, { only: id })
				})
			});
		}
		/**
		* Render the sidebar column.
		* @param props - the props of the native sidebar entry, and the update and settings buttons in `footer`.
		* @returns the rail and the conversation column.
		*/
		function RailShell({ collapsed, width, drawer, startSession, toggleSidebar, selectPanel, setPinned, useRemoteAccess, usePanels, useEntryPins, useEntryActions, useShortcuts, usePanelInfo, t, renderSlot, footer }) {
			const panels = usePanels((snapshot) => snapshot);
			const unpinned = useEntryPins((ids) => ids);
			const activePanelId = usePanelInfo((info) => info.activePanelId);
			const hasEntryActions = useEntryActions((registered) => registered);
			const toggleShortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const canStartSession = useRemoteAccess("session/create");
			const toggleLabel = collapsed ? t("toggle.open") : t("toggle.collapse");
			const [settled, setSettled] = (0, react.useState)(collapsed);
			(0, react.useEffect)(() => {
				if (drawer || !collapsed) {
					setSettled(collapsed);
					return;
				}
				const timer = window.setTimeout(() => {
					setSettled(true);
				}, COLLAPSE_SETTLE_MS);
				return () => {
					window.clearTimeout(timer);
				};
			}, [collapsed, drawer]);
			const wide = drawer || !collapsed || !settled;
			const lastWideWidth = (0, react.useRef)(width);
			if (drawer || !collapsed) lastWideWidth.current = width;
			const column = (0, react.useRef)(null);
			(0, _deepseek_ai_dsh_client_ui_primitives.useModalLayer)(column, drawer && !collapsed, toggleSidebar);
			const [moreOpen, setMoreOpen] = (0, react.useState)(false);
			const closeMore = () => {
				setMoreOpen(false);
			};
			const darwinDesktop = (0, _deepseek_ai_dsh_client_ui_primitives.isDarwinDesktop)();
			const toggle = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: toggleLabel,
				shortcutKeys: toggleShortcut?.keys,
				delayMs: 500,
				side: "right",
				portal: drawer,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					"data-sidebar-toggle": true,
					"data-modal-autofocus": drawer || void 0,
					type: "button",
					className: RailShell_module_css_default.toggle,
					"aria-label": toggleLabel,
					"aria-keyshortcuts": toggleShortcut?.aria,
					onClick: () => {
						toggleSidebar();
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutlineRegular, { size: 16 })
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: column,
				role: drawer ? "dialog" : void 0,
				"data-shortcut-modal": drawer ? "sidebar" : void 0,
				"aria-modal": drawer && !collapsed ? true : void 0,
				"aria-label": drawer ? t("navigation.label") : void 0,
				tabIndex: drawer ? -1 : void 0,
				className: classes(RailShell_module_css_default.root, !wide && RailShell_module_css_default.collapsed, !drawer && collapsed && wide && RailShell_module_css_default.fading),
				style: wide ? { width: !drawer && collapsed ? lastWideWidth.current : width } : void 0,
				children: [darwinDesktop && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: RailShell_module_css_default.topStrip,
					"data-window-drag": true,
					children: toggle
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RailShell_module_css_default.body,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
						className: RailShell_module_css_default.rail,
						"aria-label": t("panels.label"),
						children: [
							!darwinDesktop && toggle,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: RailShell_module_css_default.brand,
								"aria-hidden": "true",
								children: renderSlot("sidebar.brand.mark", { size: 24 }, { fallback: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size: 24 }) })
							}),
							!wide && canStartSession && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("session.new.label"),
								delayMs: 500,
								side: "right",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: RailShell_module_css_default.railButton,
									"aria-label": t("session.new.label"),
									onClick: () => {
										startSession();
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutlineRegular, { size: RAIL_ICON_SIZE })
								})
							}),
							panels.filter(({ id }) => id === FIXED_PANEL_ID || !unpinned.includes(id)).map(({ id, label }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RailPanel, {
								id,
								label,
								usePanelInfo,
								selectPanel,
								renderSlot
							}, id)),
							hasEntryActions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
								open: moreOpen,
								onClose: closeMore,
								portal: true,
								autoFocus: true,
								side: "right",
								anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("panels.more"),
									delayMs: 500,
									side: "right",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: RailShell_module_css_default.railButton,
										"aria-label": t("panels.more"),
										"aria-haspopup": "menu",
										"aria-expanded": moreOpen,
										onClick: () => {
											setMoreOpen((value) => !value);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAppsAddOutlineRegular, { size: RAIL_ICON_SIZE })
									})
								}),
								children: renderSlot("sidebar.panellist.actions", {
									entries: panels.filter(({ id }) => id !== FIXED_PANEL_ID).map(({ id, label }) => ({
										id,
										label,
										pinned: !unpinned.includes(id),
										active: id === activePanelId
									})),
									onOpen: (id) => {
										selectPanel(id);
									},
									onPinnedChange: setPinned,
									onDismiss: closeMore
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: RailShell_module_css_default.railSpacer }),
							renderSlot("sidebar.footer.action", { wide: false }),
							footer,
							renderSlot("sidebar.settings", { wide: false })
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RailShell_module_css_default.main,
						children: renderSlot("sidebar.workspaces", {
							wide,
							expandSidebar: () => {
								if (collapsed) toggleSidebar();
							}
						})
					})]
				})]
			});
		}
		//#endregion
		//#region src/client/sort-store.ts
		/**
		* Keeps the sort state of the sidebar sections in the browser.
		* @module dsh-better-left-sidebar/client/sort-store
		*/
		const STORAGE_KEY = "dsh-better-left-sidebar:sections";
		function read() {
			try {
				return parseSorts(localStorage.getItem(STORAGE_KEY));
			} catch (error) {
				return parseSorts(null);
			}
		}
		function write(sorts) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(sorts));
			} catch (error) {}
		}
		/**
		* Create the store from the saved state.
		* @returns a store that saves each change.
		*/
		function createSortStore() {
			let sorts = read();
			const listeners = /* @__PURE__ */ new Set();
			const commit = (next) => {
				sorts = next;
				write(next);
				for (const listener of listeners) listener();
			};
			return {
				getSnapshot: () => sorts,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				setMode: (section, mode, shown) => {
					const current = sorts[section];
					if (current.mode === mode) return;
					commit({
						...sorts,
						[section]: {
							mode,
							order: current.order.length === 0 ? [...shown] : current.order
						}
					});
				},
				setOrder: (section, order) => {
					commit({
						...sorts,
						[section]: {
							...sorts[section],
							order: [...order]
						}
					});
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Services this plugin needs. */
		const inject = ["slots", "locale"];
		const NS = "better-left-sidebar";
		/**
		* Register the replacement sidebar.
		* @param ctx - client context.
		*/
		function apply(ctx) {
			const slots = ctx.slots;
			ctx.effect(() => ctx.locale.register(NS, {
				en,
				zh
			}), "better-left-sidebar: dictionaries");
			const openChat = { current: void 0 };
			const RailFooter = createRailFooter(slots, ctx.locale.bind("settings"));
			const Shell = (props) => (0, react.createElement)(RailShell, {
				...props,
				footer: (0, react.createElement)(RailFooter)
			});
			ctx.effect(() => shadowSlot(slots, "sidebar", Shell), "better-left-sidebar: shell");
			ctx.effect(() => shadowSlot(slots, "sidebar.workspaces", createConversationBrowser(createSortStore(), openChat), NS), "better-left-sidebar: conversations");
			const browserText = ctx.locale.bind(NS);
			ctx.inject(["shortcuts", "contextMenus"], (scope) => {
				const { shortcuts, contextMenus } = scope;
				scope.effect(() => registerPinShortcut(shortcuts, contextMenus, openChat, {
					label: () => browserText("shortcut.pin"),
					noChat: () => browserText("shortcut.noChat")
				}), "better-left-sidebar: pin shortcut");
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map