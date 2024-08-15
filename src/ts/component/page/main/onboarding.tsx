import * as React from 'react';
import $ from 'jquery';
import { C, I, translate, U } from 'Lib';
import { Icon, Title, Label, Button } from 'Component';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Keyboard } from 'swiper/modules';

enum Stage {
	Type	 = 0,
	Purpose	 = 1,
	Usecase	 = 2,
};

type State = {
	stage: Stage;
};

class PageMainOnboarding extends React.Component<I.PageComponent, State> {

	node: any = null;
	swiper = null;
	usecases: any[] = [];
	current: number = 0;
	bounceTimeout: any = null;

	state: State = {
		stage: Stage.Type,
	};
	param: any = {
		type: I.SpaceType.Private,
		purpose: 'personal',
		usecase: 0,
	};

	constructor (props: I.PageComponent) {
		super(props);

		this.getItems = this.getItems.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.onBack = this.onBack.bind(this);
		this.onSwiper = this.onSwiper.bind(this);
		this.onSlideClick = this.onSlideClick.bind(this);
	};

	render () {
		const { stage } = this.state;
		const { type } = this.param;
		const cn = [ 'wrapper', `stage${Stage[stage]}` ];
		const items = this.getItems(stage);
		const stagesArray = Object.keys(Stage).filter(key => isNaN(Number(key)));

		const Item = (el) => {
			const prefix = U.Common.toCamelCase(`onboardingExperienceItems-${el.id}`);

			let labelPrefix = '';
			if (el.id == 'personal') {
				labelPrefix = U.Common.toCamelCase(`onboardingExperienceItems-${el.id}-${I.SpaceType[type]}`)
			};

			return (
				<div onClick={() => this.onItemClick(el)} className={[ 'item', `item-${el.id}` ].join(' ')}>
					<Icon className={el.id} />
					<div className="text">
						<Title text={translate(`${prefix}Title`)} />
						<Label text={translate(`${labelPrefix ? labelPrefix : prefix}Text`)} />
					</div>
				</div>
			);
		};

		const UsecaseItem = (el) => {
			const screenshot = el.screenshots.length ? el.screenshots[0] : '';

			return (
				<div className={[ 'item', `item-${el.id}`].join(' ')} onClick={() => this.onSlideClick(el.idx)} onMouseEnter={() => this.onUsecaseHover(el.idx)}>
					<div className="picture" style={{ backgroundImage: `url("${screenshot}")` }}></div>
					<div className="text">
						<Title text={el.title} />
						<Label text={el.description} />
					</div>
				</div>
			);
		};

		let content = null;
		if (stage == Stage.Usecase) {
			let buttonText = '';
			if (this.current == this.usecases.length - 1) {
				buttonText = translate('onboardingExperienceUsecaseButtonStartFromScratch');
			} else {
				buttonText = translate('onboardingExperienceUsecaseButtonSelectExperience');
			};

			content = (
				<React.Fragment>
					<div className="usecases">
						<Swiper
							effect={'creative'}
							creativeEffect={{
								prev: {
									translate: ['-90%', 0, 0],
									scale: 0.5,
								},
								next: {
									translate: ['90%', 0, 0],
									scale: 0.5,
								},
							}}
							keyboard={{ enabled: true }}
							modules={[ EffectCreative, Keyboard ]}
							spaceBetween={95}
							speed={500}
							slidesPerView={1.7}
							centeredSlides={true}
							onSlideChange={() => this.onSlideChange()}
							onSwiper={swiper => this.onSwiper(swiper)}
						>
							{this.usecases.map((el: any, i: number) => (
								<SwiperSlide key={i}>
									<UsecaseItem {...el} idx={i} />
								</SwiperSlide>
							))}
						</Swiper>
					</div>
					<div className="buttonWrapper">
						<Button className="c24" text={buttonText} />
					</div>
				</React.Fragment>
			)
		} else {
			content = <div className="items">{items.map((el, i) => <Item key={i} {...el} />)}</div>;
		};

		return (
			<div ref={ref => this.node = ref} className={cn.join(' ')}>
				{this.canMoveBack() ? <Icon className="arrow back" onClick={this.onBack} /> : ''}

				<Title className="sub" text={translate(`onboardingExperienceSubTitle`)} />

				<div className="steps">
					{stagesArray.map((el, i) => (
						<div key={i} className={[ 'step', i == stage ? 'active' : ''].join(' ')} />
					))}
				</div>

				<div className="itemsWrapper">
					<div className="stepTitle">
						{stagesArray.map((el, i) => (
							<Title className={stage == i ? 'active' : ''} text={translate(`onboardingExperience${Stage[i]}Title`)} />
						))}
					</div>

					{content}
				</div>
			</div>
		);
	};

	componentDidMount () {
		this.loadUsecases();
	};

	loadUsecases () {
		const empty = {
			id: 'empty',
			title: translate('onboardingExperienceUsecaseStartFromScratchTitle'),
			description: translate('onboardingExperienceUsecaseStartFromScratchText'),
			screenshots: []
		};
		C.GalleryDownloadIndex((message: any) => {
			this.usecases = (message.list || []).slice(0,3);
			this.usecases.push(empty);
			this.forceUpdate();
		});
	};

	getItems (stage: Stage) {
		const { type } = this.param;
		let ret = [];

		switch (stage) {
			default:
			case Stage.Type: {
				ret = [
					{ id: 'private', value: I.SpaceType.Private },
					{ id: 'shared', value: I.SpaceType.Shared },
				];

				break;
			};
			case Stage.Purpose: {
				ret = [
					{ id: 'personal', value: 'personal' },
					{ id: 'education', value: 'education' },
					{ id: 'work', value: 'work' },
				];

				if (type == I.SpaceType.Shared) {
					ret.push({ id: 'community', value: 'community' });
				};

				break;
			};
			case Stage.Usecase: {
				// getting usecases logic
				ret = this.usecases;
				break;
			};
		};

		return ret.map(it => ({ ...it, stage }));
	};

	onSwiper (swiper) {
		this.swiper = swiper;
		this.makeBounce();
	};

	makeBounce (stop?: boolean) {
		if (!this.usecases) {
			return;
		};

		const targetId = this.usecases[1].id;
		const target = $(`.usecases .item-${targetId}`);

		target.addClass('bounce').addClass('hover');
		this.bounceTimeout = window.setTimeout(() => {
			target.removeClass('hover');

			if (!stop) {
				this.bounceTimeout = window.setTimeout(() => {
					this.makeBounce(true);
				}, 1000);
			} else {
				this.bounceTimeout = null;
				target.removeClass('bounce');
			};
		}, 1000);
	};

	onUsecaseHover (idx) {
		if (!this.current && this.bounceTimeout && (idx == this.current + 1)) {
			const targetId = this.usecases[idx].id;
			const target = $(`.usecases .item-${targetId}`);

			clearTimeout(this.bounceTimeout);
			this.bounceTimeout = null;
			target.removeClass('bounce').removeClass('hover');
		};
	};

	onSlideChange () {
		if (!this.swiper) {
			return;
		};

		this.current = this.swiper.activeIndex;
		this.forceUpdate();
	};

	onSlideClick (idx) {
		if (!this.swiper || (idx == this.current)) {
			return;
		};

		idx > this.current ? this.swiper.slideNext() : this.swiper.slidePrev();
	};

	onItemClick (item: any) {
		const { stage } = this.state;
		const paramKey = Stage[stage].toLowerCase();

		this.param[paramKey] = item.value;
		this.setState({ stage: stage + 1 });
	};

	onBack () {
		if (!this.canMoveBack()) {
			return;
		};

		const { stage } = this.state;

		this.setState({ stage: stage - 1 });
	};

	canMoveBack (): boolean {
		return this.state.stage > Stage.Type;
	};

	onFinish (routeParam) {
		U.Data.onAuth({ routeParam });
		U.Data.onAuthOnce(true);
	};
};

export default PageMainOnboarding;
