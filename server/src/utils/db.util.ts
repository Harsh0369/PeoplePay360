import { Model } from "mongoose";

/**
 * Total-count helper for paginated lists.
 *
 * For an UNFILTERED list we use `estimatedDocumentCount()`, which reads the
 * collection's metadata in O(1) instead of scanning — a big win on large
 * collections (attendance ~32k, business logs ~5k) that were previously running a
 * full `countDocuments({})` on every page request.
 *
 * When a filter IS present we fall back to `countDocuments(query)` so the total
 * stays exact for that filtered view.
 */
export async function smartCount(model: Model<any>, query: Record<string, any> = {}): Promise<number> {
  return Object.keys(query).length === 0
    ? model.estimatedDocumentCount()
    : model.countDocuments(query);
}
