import * as anModel from "core/annotationsModel";

export interface TagRecord {
  tag: string;
  anBodyType: anModel.AnBodyType;
  annotations: Array<anModel.Annotation>;
  showAnnotationsFlag: boolean;
}

type TagIndex = Record<string, Array<anModel.Annotation>>;

function mkKey(tag: string, anBodyType: anModel.AnBodyType): string {
  return tag + "_" + anBodyType;
}

function groupByTag(anl: Array<anModel.Annotation>): [Array<string>, TagIndex] {
  const index = {} as TagIndex;
  const tags = new Set<string>();
  anl.forEach(
    an => {
      tags.add(anModel.getLabel(an));
      const tag = anModel.getLabel(an);
      const anBodyType = anModel.getAnBodyType(an.body);
      const key = mkKey(tag, anBodyType);
      const ans = index[key];
      if (ans) {
        index[key] = [...ans, an];
      } else {
        index[key] = [an];
      }
    }
  );
  return [Array.from(tags), index];
}

export function mkTagRecords(anl: Array<anModel.Annotation>): Array<TagRecord> {
  const [tags, tagIndex] = groupByTag(anl);
  return tags.reduce(
    (res, tag) => {
      const semantic = tagIndex[mkKey(tag, anModel.AnBodyType.SEMANTIC)];
      const keyword = tagIndex[mkKey(tag, anModel.AnBodyType.KEYWORD)];
      const comment = tagIndex[mkKey(tag, anModel.AnBodyType.COMMENT)];
      const semanticItem = semantic ?
        [{
        tag,
        anBodyType: anModel.AnBodyType.SEMANTIC,
        annotations: semantic,
        showAnnotationsFlag: false
      }] : [];
      const keywordItem = keyword ?
        [{
        tag,
        anBodyType: anModel.AnBodyType.KEYWORD,
        annotations: keyword,
        showAnnotationsFlag: false
      }] : [];
      const commentItem = comment ?
        [{
        tag,
        anBodyType: anModel.AnBodyType.COMMENT,
        annotations: comment,
        showAnnotationsFlag: false
      }] : [];
      return [...res, ...semanticItem, ...keywordItem, ...commentItem];
    },
    [] as Array<TagRecord>
  );
}
