import { renderAtom } from '../../utils/util';
import { atomDate, unixDate } from '../../utils/parse-date';
import { genUuidBySeed } from '../../utils/uuid';

let deal = async (ctx) => {
	const baseUrl = 'https://alhs.xyz/';
	const { cat } = ctx.req.param();
	const catMap = {
		all: 'all-post-with-nav/',
		origin: 'archives/category/yuan-chuang-xiao-shuo/',
		interact: 'archives/category/hu-dong-xiao-shuo/',
		trans: 'archives/category/ban-yun-xiao-shuo/',
		audio: 'archives/category/yin-sheng/',
		set: 'archives/category/she-ding-qu/',
	};
	let title = '';
	let link = `${ baseUrl }index.php/${ catMap[cat] }`;
	let res = await fetch(link, {
		headers: {
			Referer: baseUrl,
		},
	});
	let description = '一个幻想风格的小说站';
	let language = 'zh-cn';
	let articles = [];
	let authors = [];
	let dates = [];
	let src_links = [];
	let new_res = new HTMLRewriter()
		.on('head > title', {
			text(text) {
				title += text.text;
			}
		})
		.on('main > article > header > a', {
			text(text) {
				if (text.text !== '') {
					articles.push(text.text);
					dates.push('');
				}
			},
		})
		.on('main > article > header > a', {
			element(element) {
				src_links.push(element.getAttribute('href'));
			},
		})
		.on('main > article > header > div > .post-meta-detail-time > time', {
			text(text) {
				if (text.text !== '') {
					dates[dates.length -1] += atomDate(text.text.trim());
				}
			},
		})
		.on('main > article > header > div > .post-meta-detail-author > a', {
			text(text) {
				if (text.text !== '') {
					authors.push(text.text);
				}
			},
		})
		.transform(res);
	await new_res.text();
	
	let descs = await Promise.all(
		src_links.map(async (item) => {
			let data = await fetch(item, {
				headers: {
					Referer: baseUrl,
				},
			});
			let desc = '';
			let new_data = new HTMLRewriter()
				.on('#post_content > p', {
					text(text) {
						if (text.text !== '') {
							desc += '&nbsp;&nbsp;' + text.text + '<br>';
						}
					},
				})
				.transform(data);
			await new_data.text();
			return desc;
		})
	)

	let items = [];
	for (let i = 0; i < articles.length; i++) {
		let item = {
			title: articles[i],
			author: authors[i],
			link: src_links[i],
			description: descs[i],
			updated: dates[i],
			timestamp: unixDate(dates[i]),
			guid: 'urn:uuid:' + genUuidBySeed(`${ articles[i] }${ dates[i] }`),
		};
		items.push(item);
	}
	items.sort((a, b) => b.timestamp - a.timestamp);
	let data = {
		updated: items[0].updated,
		id: 'urn:uuid:' + genUuidBySeed(title + items[0].updated),
		title: title,
		link: link,
		author: 'alhs',
		subtitle: description,
		language: language,
		item: items,
	};
	ctx.header('Content-Type', 'application/xml');
	return ctx.body(renderAtom(data));
}

let setup = (route) => {
	route.get('/alhs/feeds/:cat', deal);
};

export default {
	setup
};
