import React, { forwardRef, useRef, useState, useEffect } from 'react';
import $ from 'jquery';
import raf from 'raf';
import { observer } from 'mobx-react';
import { Header, Footer, Loader, Block, Deleted } from 'Component';
import { I, M, C, S, U, J, Action } from 'Lib';

const PageMainChat = observer(forwardRef<{}, I.PageComponent>((props, ref) => {

	const { isPopup, match } = props;
	const nodeRef = useRef(null);
	const headerRef = useRef(null);
	const idRef = useRef('');
	const [ isLoading, setIsLoading ] = useState(false);
	const [ isDeleted, setIsDeleted ] = useState(false);
	const rootId = props.rootId ? props.rootId : match?.params?.id;
	const object = S.Detail.get(rootId, rootId, [ 'chatId' ]);

	if (isDeleted || object.isDeleted) {
		return <Deleted {...props} />;
	};

	const open = () => {
		if (idRef.current == rootId) {
			return;
		};

		close();
		setIsLoading(true);
		setIsDeleted(false);

		idRef.current = rootId;

		C.ObjectOpen(rootId, '', U.Router.getRouteSpaceId(), (message: any) => {
			setIsLoading(false);

			if (!U.Common.checkErrorOnOpen(rootId, message.error.code, this)) {
				return;
			};

			const object = S.Detail.get(rootId, rootId, []);
			if (object.isDeleted) {
				return;
			};

			headerRef.current?.forceUpdate();
			resize();
		});
	};

	const close = () => {
		const id = idRef.current;

		if (!id) {
			return;
		};

		const close = !(isPopup && (match?.params?.id == id));

		if (close) {
			Action.pageClose(id, true);
		};
	};

	const isReadonly = () => {
		const root = S.Block.getLeaf(rootId, rootId);
		const object = S.Detail.get(rootId, rootId, []);

		return !U.Space.canMyParticipantWrite() || object.isArchived || root?.isLocked();
	};

	const resize = () => {
		if (isLoading) {
			return;
		};

		raf(() => {
			const node = $(nodeRef.current);
			const cover = node.find('.block.blockCover');
			const pageContainer = U.Common.getPageContainer(isPopup);
			const scrollContainer = U.Common.getScrollContainer(isPopup);
			const header = pageContainer.find('#header');
			const headerHeight = isPopup ? header.height() : J.Size.header;
			const scrollWrapper = node.find('#scrollWrapper');
			const formWrapper = node.find('#formWrapper').addClass('isFixed');
			const controls = node.find('.editorControls');
			const head = node.find('.headSimple');

			if (cover.length) {
				cover.css({ top: headerHeight }).toggleClass('isFull', cover.width() <= J.Size.editor);
			};

			const fh = Number(formWrapper.outerHeight(true)) || 0;
			const ch = Number(controls.outerHeight(true)) || 0;
			const hh = Number(head.outerHeight(true)) || 0;
			const mh = scrollContainer.height() - headerHeight - fh - ch - hh;

			scrollWrapper.css({ minHeight: mh });
		});
	};

	let content = null;

	if (isLoading) {
		content = <Loader id="loader" />;
	} else {
		content = (
			<div className="blocks">
				<Block
					{...props}
					key={J.Constant.blockId.chat}
					rootId={rootId}
					iconSize={20}
					block={new M.Block({ id: J.Constant.blockId.chat, type: I.BlockType.Chat, childrenIds: [], fields: {}, content: {} })}
					className="noPlus"
					isSelectionDisabled={true}
					isContextMenuDisabled={true}
					readonly={isReadonly()}
				/>
			</div>
		);
	};

	useEffect(() => {
		return () => close();
	}, []);

	useEffect(() => {
		open();
		resize();
	});

	return (
		<div ref={nodeRef}>
			<Header 
				{...props} 
				component="mainChat" 
				ref={headerRef} 
				rootId={object.chatId} 
			/>

			<div id="bodyWrapper" className="wrapper">
				<div className="editorWrapper isChat">
					{content}
				</div>
			</div>

			<Footer component="mainObject" {...props} />
		</div>
	);

}));

export default PageMainChat;