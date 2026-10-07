"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  ExternalLink,
  Package,
  Plus,
  X,
  Search,
  Check,
  ImageIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  usePostLinks,
  useSetPostLinks,
  useDeletePostLink,
  useChannelPosts,
} from "@/hooks/queries/useComments";
import { channelsApi } from "@/lib/api/channels.api";
import { productsApi } from "@/lib/api/products.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { queryKeys } from "@/lib/queryKeys";
import { CardListSkeleton } from "@/components/common/skeletons/Skeletons";
import type { PagePostDTO, PostLinkDTO } from "@/types/comment";

export function PostLinkManager() {
  const t = useTranslations("comments");
  const { shopId } = useCurrentShop();

  // Channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: queryKeys.channels(shopId),
    queryFn: () => channelsApi.list(shopId!),
    enabled: Boolean(shopId),
  });

  const [selectedChannelId, setSelectedChannelId] = useState<string>("");

  // Default to first channel when loaded
  const activeChannelId =
    selectedChannelId || (channels.length > 0 ? channels[0].id : "");

  // Channel posts
  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
  } = useChannelPosts(activeChannelId);

  // All post links for shop
  const { data: postLinks = [], isLoading: linksLoading } = usePostLinks();

  // Products catalogue
  const { data: productsData } = useQuery({
    queryKey: queryKeys.products(shopId!),
    queryFn: () => productsApi.list(shopId!, { limit: 100 }),
    enabled: Boolean(shopId),
  });
  const products = useMemo(
    () => productsData?.data ?? [],
    [productsData?.data],
  );

  // Mutations
  const setLinksMutation = useSetPostLinks();
  const deleteLinkMutation = useDeletePostLink();

  // Dialog state
  const [activePost, setActivePost] = useState<PagePostDTO | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Map post links by postId
  const linksByPost = useMemo(() => {
    const map = new Map<string, PostLinkDTO[]>();
    for (const link of postLinks) {
      const list = map.get(link.postId) ?? [];
      list.push(link);
      map.set(link.postId, list);
    }
    return map;
  }, [postLinks]);

  const handleOpenLinkModal = (post: PagePostDTO) => {
    setActivePost(post);
    const existing = linksByPost.get(post.id) ?? [];
    setSelectedProductIds(existing.map((l) => l.product.id));
    setProductSearch("");
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSaveLinks = async () => {
    if (!activePost || !activeChannelId) return;

    try {
      await setLinksMutation.mutateAsync({
        channelConnectionId: activeChannelId,
        postId: activePost.id,
        productIds: selectedProductIds,
      });
      toast.success(t("successLinksSaved"));
      setActivePost(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save links";
      toast.error(msg);
    }
  };

  const handleDeleteLink = async (linkId: string, postId: string) => {
    try {
      await deleteLinkMutation.mutateAsync({ linkId, postId });
      toast.success("Product unlinked");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unlink product";
      toast.error(msg);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const isLoading = channelsLoading || postsLoading || linksLoading;

  return (
    <div className="space-y-4">
      {/* Top bar with channel selector */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("tabPostLinks")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("postLinksDesc")}
          </p>
        </div>

        {channels.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Page:</span>
            <select
              value={activeChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm font-medium focus:border-primary focus:outline-hidden"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {channels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Please connect a Facebook Page in Settings &gt; Facebook pages first.
          </p>
        </div>
      ) : isLoading ? (
        <CardListSkeleton rows={4} />
      ) : postsError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load posts from Facebook Page.
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("noPosts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const currentLinks = linksByPost.get(post.id) ?? [];
            return (
              <div
                key={post.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-border/80 transition-all"
              >
                <div className="space-y-3">
                  {/* Post image */}
                  {post.fullPicture ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.fullPicture}
                        alt="Post media"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted/40 text-muted-foreground">
                      <ImageIcon className="size-8 stroke-1" />
                    </div>
                  )}

                  {/* Post text */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>{dayjs(post.createdTime).format("MMM D, YYYY")}</span>
                      {post.permalinkUrl && (
                        <a
                          href={post.permalinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-primary"
                        >
                          <span>Facebook</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-foreground/90 line-clamp-2">
                      {post.message || "No caption"}
                    </p>
                  </div>

                  {/* Linked products */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                      <span>
                        {t("linkedCount", { count: String(currentLinks.length) })}
                      </span>
                    </div>

                    {currentLinks.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {currentLinks.map((link) => (
                          <span
                            key={link.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            <Package className="size-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">
                              {link.product.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ৳{Math.round(link.product.pricePaisa / 100)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(link.id, post.id)}
                              className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-destructive"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">
                        No products linked yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Link button */}
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenLinkModal(post)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background py-2 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>{t("linkProducts")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Selection Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-semibold">
                  {t("selectProducts")}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Post: &ldquo;{activePost.message || "Post"}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Product search */}
            <div className="relative my-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name..."
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Products picker list */}
            <div className="max-h-60 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
              {filteredProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No products found.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleToggleProduct(p.id)}
                      className={`w-full flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                        isChecked
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex size-4 items-center justify-center rounded border ${
                            isChecked
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {isChecked && <Check className="size-3 stroke-3" />}
                        </div>
                        <span className="truncate max-w-[240px]">{p.name}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">
                        ৳{Math.round(p.pricePaisa / 100)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {selectedProductIds.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePost(null)}
                  className="rounded-xl border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLinks}
                  disabled={setLinksMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {setLinksMutation.isPending ? "Saving..." : t("saveLinks")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
