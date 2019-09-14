export interface IOptions {
	interval?: number;
	max?: number;
}

export type IPublisher<T = any> = (value: T) => number;
export type ISubscriber<T = any> = (queue: T[]) => any;

export interface ISaturated<T = any> {
	push: IPublisher<T>;
	flush: () => void;
	end: (toFlush?: boolean) => void;
	size: () => number;
}

declare function saturated<T = any>(caller: ISubscriber<T>, opts?: IOptions): Readonly<ISaturated<T>>;

export default saturated;
