"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  MessagesSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Pin,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Send,
  X,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const ForumView: React.FC = () => {
  const { currentUser, userForumTopics, userCourses, addForumPost, addForumReply } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(userForumTopics[0]?.id || "");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // New post form
  const [postCourseId, setPostCourseId] = useState(userCourses[0]?.id || "");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("Prisma, NextJS, Architecture");

  const selectedTopic = userForumTopics.find((t) => t.id === selectedTopicId) || userForumTopics[0] || null;

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const tagsArray = postTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addForumPost(postCourseId, postTitle, postContent, tagsArray);
    setPostTitle("");
    setPostContent("");
    setShowNewPostModal(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTopic) return;

    addForumReply(selectedTopic.id, replyContent);
    setReplyContent("");
  };

  if (userCourses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-blue-600" />
            Forum Diskusi & Kolaborasi Kelas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Wadah tanya jawab akademis, diskusi pemecahan masalah teknis, dan pengumuman dosen.
          </p>
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <MessagesSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Belum Ada Diskusi Kelas
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Akun Dosen Anda belum mengampu matakuliah untuk berpartisipasi dalam forum kelas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-blue-600" />
            Forum Diskusi & Kolaborasi Kelas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Wadah tanya jawab akademis, diskusi pemecahan masalah teknis, dan pengumuman dosen.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Buat Topik Diskusi Baru
        </button>
      </div>

      {/* Forum Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Topics List */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
            Daftar Topik Diskusi
          </h3>

          {userForumTopics.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Belum ada topik diskusi pada kelas ini.
            </div>
          ) : (
            userForumTopics.map((topic) => {
              const isSelected = topic.id === selectedTopic?.id;
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                    {topic.courseName}
                  </span>
                  {topic.isPinned && (
                    <span className="text-amber-500 font-bold text-[10px] flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Disematkan
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                  {topic.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={topic.authorAvatar}
                      alt={topic.authorName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[100px]">{topic.authorName}</span>
                  </div>
                  <span>{topic.repliesCount} Jawaban</span>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Right: Selected Topic Detail & Replies */}
        {selectedTopic && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Topic Author Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedTopic.authorAvatar}
                    alt={selectedTopic.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {selectedTopic.authorName}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {selectedTopic.authorRole} • {formatDateTime(selectedTopic.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedTopic.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Main Topic Question Body */}
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedTopic.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedTopic.content}
                </p>
              </div>

              {/* Replies Thread */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-blue-600" /> Diskusi & Jawaban ({selectedTopic.replies.length})
                </h4>

                <div className="space-y-3">
                  {selectedTopic.replies.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada tanggapan untuk topik ini. Jadilah yang pertama menjawab!</p>
                  ) : (
                    selectedTopic.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          reply.isLecturerEndorsed
                            ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={reply.authorAvatar}
                              alt={reply.authorName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {reply.authorName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatDateTime(reply.createdAt)}
                              </span>
                            </div>
                          </div>

                          {reply.isLecturerEndorsed && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> Jawaban Dosen
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input Box */}
                <form onSubmit={handleSendReply} className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Tuliskan tanggapan atau solusi Anda..."
                    className="w-full p-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim Tanggapan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Buat Topik Diskusi Baru
              </h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Matakuliah
                </label>
                <select
                  value={postCourseId}
                  onChange={(e) => setPostCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {userCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Pertanyaan / Topik
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cara konfigurasi Redis caching pada Next.js Server Actions"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Pertanyaan / Penjelasan
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan latar belakang masalah dan kode yang dicoba..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="NextJS, Redis, Cache"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Publikasikan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
