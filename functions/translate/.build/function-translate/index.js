import { randomUUID } from "node:crypto";
import { documentEventHandler } from "@sanity/functions";
import { createClient } from "@sanity/client";
//#region functions/translate/index.ts
var SCHEMA_ID = "_.schemas.default";
var PUBLISH_TRANSLATIONS = true;
var BASE_LANGUAGE = {
	id: "fr",
	title: "French"
};
var TARGET_LANGUAGES = [
	{
		id: "en",
		title: "English"
	},
	{
		id: "bg",
		title: "Bulgarian"
	},
	{
		id: "cs",
		title: "Czech"
	},
	{
		id: "da",
		title: "Danish"
	},
	{
		id: "de",
		title: "German"
	},
	{
		id: "el",
		title: "Greek"
	},
	{
		id: "es",
		title: "Spanish"
	},
	{
		id: "et",
		title: "Estonian"
	},
	{
		id: "fi",
		title: "Finnish"
	},
	{
		id: "ga",
		title: "Irish"
	},
	{
		id: "hr",
		title: "Croatian"
	},
	{
		id: "hu",
		title: "Hungarian"
	},
	{
		id: "it",
		title: "Italian"
	},
	{
		id: "lt",
		title: "Lithuanian"
	},
	{
		id: "lv",
		title: "Latvian"
	},
	{
		id: "mt",
		title: "Maltese"
	},
	{
		id: "nl",
		title: "Dutch"
	},
	{
		id: "pl",
		title: "Polish"
	},
	{
		id: "pt",
		title: "Portuguese"
	},
	{
		id: "ro",
		title: "Romanian"
	},
	{
		id: "sk",
		title: "Slovak"
	},
	{
		id: "sl",
		title: "Slovenian"
	},
	{
		id: "sv",
		title: "Swedish"
	}
];
var CONCURRENCY = 4;
var SINGLETON_TYPES = [
	"settings",
	"header",
	"footer"
];
var entryLanguage = (entry) => entry.language ?? entry._key;
var translationEntry = (language, id, type, weak) => ({
	_key: randomUUID().replace(/-/g, ""),
	_type: "internationalizedArrayReferenceValue",
	language,
	value: {
		_type: "reference",
		_ref: id,
		...weak && {
			_weak: true,
			_strengthenOnPublish: { type }
		}
	}
});
var handler = documentEventHandler(async ({ context, event }) => {
	const { _id, _type, language } = event.data;
	if (language !== BASE_LANGUAGE.id || SINGLETON_TYPES.includes(_type) && _id !== `${_type}-${BASE_LANGUAGE.id}`) {
		console.log(`Skipping ${_id}: written by this function`);
		return;
	}
	const client = createClient({
		...context.clientOptions,
		apiVersion: "vX",
		useCdn: false
	});
	const isSingleton = SINGLETON_TYPES.includes(_type);
	const metadata = isSingleton ? null : await client.fetch(`*[_type == "translation.metadata" && references($id)][0]{_id, translations}`, { id: _id });
	const existing = new Map(metadata?.translations?.map((t) => [entryLanguage(t), t.value?._ref]) ?? []);
	const registeredSource = existing.get(BASE_LANGUAGE.id);
	if (registeredSource && registeredSource !== _id) {
		console.log(`Skipping ${_id}: ${registeredSource} is the French source of this group`);
		return;
	}
	let metadataId = metadata?._id;
	if (!isSingleton && !metadataId) metadataId = (await client.create({
		_type: "translation.metadata",
		schemaTypes: [_type],
		translations: [translationEntry(BASE_LANGUAGE.id, _id, _type, false)]
	}))._id;
	else if (metadataId && !existing.has(BASE_LANGUAGE.id)) await client.patch(metadataId).setIfMissing({ translations: [] }).append("translations", [translationEntry(BASE_LANGUAGE.id, _id, _type, false)]).commit();
	async function translateInto(language) {
		let targetId = isSingleton ? `${_type}-${language.id}` : existing.get(language.id);
		const isNew = !targetId;
		targetId ??= `tr-${randomUUID()}`;
		const writeId = targetId;
		await client.createIfNotExists({
			_id: writeId,
			_type,
			language: language.id
		});
		if (isNew && metadataId) await client.patch(metadataId).append("translations", [translationEntry(language.id, targetId, _type, true)]).commit();
		await client.agent.action.translate({
			schemaId: SCHEMA_ID,
			documentId: _id,
			targetDocument: {
				operation: "edit",
				_id: writeId
			},
			languageFieldPath: "language",
			fromLanguage: BASE_LANGUAGE,
			toLanguage: language,
			forcePublishedWrite: PUBLISH_TRANSLATIONS,
			async: true
		});
		return isNew;
	}
	let added = 0;
	for (let i = 0; i < TARGET_LANGUAGES.length; i += CONCURRENCY) {
		const batch = TARGET_LANGUAGES.slice(i, i + CONCURRENCY);
		const results = await Promise.all(batch.map(translateInto));
		added += results.filter(Boolean).length;
	}
	console.log(`Queued ${TARGET_LANGUAGES.length} translations of ${_id} (${added} new)`);
});
//#endregion
export { handler };

//# sourceMappingURL=index.js.map