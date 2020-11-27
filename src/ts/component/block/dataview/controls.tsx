import * as React from 'react';
import { Icon, MenuItemVertical } from 'ts/component';
import { I, Util, translate } from 'ts/lib';
import { commonStore, blockStore, dbStore } from 'ts/store';
import { observer } from 'mobx-react';
import { C } from 'ts/lib';

interface Props extends I.ViewComponent {};

interface State {
	page: number;
};

const Constant = require('json/constant.json');

@observer
class Controls extends React.Component<Props, State> {

	state = {
		page: 0,
	};

	constructor (props: any) {
		super(props);

		this.onButton = this.onButton.bind(this);
		this.onViewAdd = this.onViewAdd.bind(this);
	};

	render () {
		const { getData, block, getView, readOnly, onRowAdd } = this.props;
		const view = getView();
		const { content } = block;
		const { views } = content;
		const { viewId } = dbStore.getMeta(block.id);
		const { page } = this.state;
		const limit = Constant.limit.dataview.views;
		const filterCnt = view.filters.length;
		const sortCnt = view.sorts.length;

		const buttons: any[] = [
			{ id: 'relation', name: 'Relations', menu: 'dataviewRelationList' },
			{ id: 'filter', name: (filterCnt > 0 ? `${filterCnt} ${Util.cntWord(filterCnt, 'filter')}` : 'Filter'), menu: 'dataviewFilter', on: filterCnt > 0 },
			{ id: 'sort', name: (sortCnt > 0 ? `${sortCnt} ${Util.cntWord(sortCnt, 'sort')}` : 'Sort'), menu: 'dataviewSort', on: sortCnt > 0 },
			{ id: 'view', className: 'c' + view.type, arrow: true, menu: 'dataviewViewList' },
			{ id: 'more', menu: 'dataviewViewEdit' },
		];

		const ViewItem = (item: any) => (
			<div id={'item-' + item.id} className={'item ' + (item.active ? 'active' : '')} onClick={(e: any) => { getData(item.id, 0); }}>
				{item.name}
			</div>
		);
		
		const ButtonItem = (item: any) => {
			let icn = [ item.id, String(item.className || '') ];
			let cn = [ 'item', (item.on ? 'on' : '') ].concat(icn);
			return (
				<MenuItemVertical 
					id={'button-' + item.id} 
					menuId={item.menu}
					name={item.name}
					className={cn.join(' ')} 
					icon={icn.join(' ')}
					arrow={item.arrow}
					onClick={(e: any) => { this.onButton(e, item.id, item.menu); }}
				/>
			);
		};
		
		return (
			<div className="dataviewControls">
				<div className="views">
					{views.slice(page * limit, (page + 1) * limit).map((item: I.View, i: number) => (
						<ViewItem key={i} {...item} active={item.id == viewId} />
					))}
					<div className="item">
						<Icon id="button-view-add" className="plus" onClick={this.onViewAdd} />
					</div>
					<div className="item dn">
						<Icon className={[ 'back', (page == 0 ? 'disabled' : '') ].join(' ')} onClick={(e: any) => { this.onArrow(-1); }} />
						<Icon className={[ 'forward', (page == this.getMaxPage() ? 'disabled' : '') ].join(' ')} onClick={(e: any) => { this.onArrow(1); }} />
					</div>
				</div>
				
				<div className="buttons">
					<div className="side left">
						{!readOnly ? (
							<div className="item" onClick={onRowAdd}>
								<Icon className="plus" />
								<div className="name">{translate('blockDataviewNew')}</div>
							</div>
						) : ''}
					</div>

					<div className="side right">
						{buttons.map((item: any, i: number) => (
							<ButtonItem key={item.id} {...item} />
						))}
					</div>
				</div>
			</div>
		);
	};
	
	onButton (e: any, id: string, menu: string) {
		const { rootId, block, readOnly, getData, getView } = this.props;

		commonStore.menuOpen(menu, { 
			element: '#item-button-' + id,
			type: I.MenuType.Vertical,
			offsetX: 0,
			offsetY: 4,
			vertical: I.MenuDirection.Bottom,
			horizontal: I.MenuDirection.Right,
			data: {
				readOnly: readOnly,
				rootId: rootId,
				blockId: block.id, 
				getData: getData,
				getView: getView,
			},
		});
	};

	onViewAdd (e: any) {
		const { rootId, block, getData, getView } = this.props;
		const { content } = block;
		const { views } = content;

		C.BlockDataviewViewCreate(rootId, block.id, { name: Constant.default.viewName }, (message: any) => {
			getData(message.viewId, 0);

			const view = views.find((item: any) => { return item.id == message.viewId; });
			if (!view) {
				return;
			};

			commonStore.menuOpen('dataviewViewEdit', {
				type: I.MenuType.Vertical,
				element: '#button-view-add',
				offsetX: 0,
				offsetY: 4,
				vertical: I.MenuDirection.Bottom,
				horizontal: I.MenuDirection.Center,
				data: {
					rootId: rootId,
					blockId: block.id,
					view: view,
					getData: getData,
					getView: getView,
				},
			});
		});
	};

	onArrow (dir: number) {
		let { page } = this.state;

		page += dir;
		page = Math.max(0, page);
		page = Math.min(this.getMaxPage(), page);

		this.setState({ page: page });
	};

	getMaxPage () {
		const { block } = this.props;
		const { content } = block;
		const { views } = content;
		const limit = Constant.limit.dataview.views;

		return Math.ceil(views.length / limit) - 1;
	};

};

export default Controls;