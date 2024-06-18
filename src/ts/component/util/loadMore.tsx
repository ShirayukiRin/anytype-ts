import * as React from 'react';
import { Icon } from 'Component';
import { translate, U } from 'Lib';

interface Props {
	limit: number;
	loaded?: number;
	total?: number;
	onClick?(e: any): void;
};

class LoadMore extends React.Component<Props> {

	public static defaultProps = {
		limit: 10,
	};

	render () {
		const { limit, loaded, total, onClick } = this.props;

		let number = limit;
		if (loaded && total) {
			const left = total - loaded;
			number = limit < left ? limit : left;
		};

		return (
			<div className="loadMore" onClick={onClick}>
				<Icon />
				<div className="name">{U.Common.sprintf(translate('utilLoadMoreText'), number, U.Common.plural(number, translate('pluralObject')))}</div>
			</div>
		);
	};

	
};

export default LoadMore;
