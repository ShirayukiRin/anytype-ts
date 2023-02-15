import * as React from 'react';
import { I, DataUtil, ObjectUtil, Relation, keyboard } from 'Lib';
import { dbStore, detailStore } from 'Store';
import { observer } from 'mobx-react';
import Cell from 'Component/block/dataview/cell';

interface Props extends I.ViewComponent {
	id: string;
	groupId: string;
	index: number;
	onDragStartCard?: (e: any, groupId: any, record: any) => void;
};

const Card = observer(class Card extends React.Component<Props> {

	_isMounted = false;
	node: any = null;

	render () {
		const { rootId, block, groupId, id, getView, onContext, onRef, onDragStartCard, getIdPrefix, isInline, getVisibleRelations } = this.props;
		const view = getView();
		const relations = getVisibleRelations();
		const idPrefix = getIdPrefix();
		const subId = dbStore.getGroupSubId(rootId, block.id, groupId);
		const record = detailStore.get(subId, id);
		const cn = [ 'card', DataUtil.layoutClass(record.id, record.layout) ];
		const { done } = record;

		let content = (
			<div className="cardContent">
				{relations.map((relation: any, i: number) => {
					const id = Relation.cellId(idPrefix, relation.relationKey, 0);
					return (
						<Cell
							key={'board-cell-' + view.id + relation.relationKey}
							{...this.props}
							getRecord={() => { return record; }}
							subId={subId}
							ref={(ref: any) => { onRef(ref, id); }}
							relationKey={relation.relationKey}
							index={0}
							viewType={view.type}
							idPrefix={idPrefix}
							arrayLimit={2}
							showTooltip={true}
							tooltipX={I.MenuDirection.Left}
							iconSize={18}
						/>
					);
				})}
			</div>
		);

		if (!isInline) {
			content = (
				<div
					id={'selectable-' + record.id}
					className={[ 'selectable', 'type-' + I.SelectType.Record ].join(' ')}
					data-id={record.id}
					data-type={I.SelectType.Record}
				>
					{content}
				</div>
			);
		};

		return (
			<div 
				ref={node => this.node = node} 
				id={`card-${record.id}`}
				className={cn.join(' ')} 
				data-id={record.id}
				draggable={true}
				onDragStart={(e: any) => { onDragStartCard(e, groupId, record); }}
				onClick={(e: any) => { this.onClick(e); }}
				onContextMenu={(e: any) => { onContext(e, record.id); }}
			>
				{content}
			</div>
		);
	};

	componentDidMount () {
		this._isMounted = true;
		this.resize();
	};

	componentDidUpdate () {
		this.resize();
	};

	componentWillUnmount () {
		this._isMounted = false;
	};

	onClick (e: any) {
		e.preventDefault();

		const { rootId, block, groupId, id, onContext, dataset } = this.props;
		const { selection } = dataset || {};
		const subId = dbStore.getGroupSubId(rootId, block.id, groupId);
		const record = detailStore.get(subId, id);
		const cb = {
			0: () => {
				keyboard.withCommand(e) ? ObjectUtil.openWindow(record) : ObjectUtil.openPopup(record); 
			},
			2: () => { onContext(e, record.id); }
		};

		const ids = selection ? selection.get(I.SelectType.Record) : [];
		if (keyboard.withCommand(e) && ids.length) {
			return;
		};

		if (cb[e.button]) {
			cb[e.button]();
		};
	};

	resize () {
		if (!this._isMounted) {
			return;
		};

		const node = $(this.node);
		const last = node.find('.cellContent:not(.isEmpty)').last();

		node.find('.cellContent').removeClass('last');
		if (last.length) {
			last.addClass('last');
		};
	};

});

export default Card;