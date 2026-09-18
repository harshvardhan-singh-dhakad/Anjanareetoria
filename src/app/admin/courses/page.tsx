"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  X,
  Sparkles,
  Video,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import type { Course, CourseModule, CourseLesson } from '@/lib/db/cmsStore';
import { adminFetch } from '@/lib/admin/adminClient';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Spiritual Wisdom');
  const [level, setLevel] = useState<'All Levels' | 'Beginner' | 'Intermediate' | 'Mastery'>('All Levels');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(2999);
  const [thumbnail, setThumbnail] = useState('/images/blog/sacred-morning-rituals.svg');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [instructorName, setInstructorName] = useState('Acharya Rajesh Shastri');
  const [instructorTitle, setInstructorTitle] = useState('Vedic Master & Energy Guide');
  const [whatYouLearnText, setWhatYouLearnText] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: `mod-${Date.now()}-1`,
      courseId: '',
      title: 'Section 1: Foundations',
      sortOrder: 1,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          moduleId: `mod-${Date.now()}-1`,
          courseId: '',
          title: 'Lesson 1: Introduction to Sacred Alignment',
          duration: '15:00',
          videoType: 'youtube',
          videoUrl: 'dQw4w9WgXcQ',
          isFreePreview: true,
          sortOrder: 1,
        },
      ],
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/courses');
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.courses) ? data.courses : Array.isArray(data.data) ? data.data : [];
        setCourses(list);
      }
    } catch (err) {
      console.error('Error fetching admin courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openNewModal = () => {
    setEditingCourse(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setDescription('');
    setCategory('Spiritual Wisdom');
    setLevel('All Levels');
    setPrice(0);
    setOriginalPrice(2999);
    setThumbnail('/images/blog/sacred-morning-rituals.svg');
    setTrailerUrl('');
    setInstructorName('Acharya Rajesh Shastri');
    setInstructorTitle('Vedic Master & Energy Guide');
    setWhatYouLearnText('Foundations of sacred energy\nHow to activate wealth resonance');
    setModules([
      {
        id: `mod-${Date.now()}-1`,
        courseId: '',
        title: 'Section 1: Foundations',
        sortOrder: 1,
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            moduleId: `mod-${Date.now()}-1`,
            courseId: '',
            title: 'Lesson 1: Introduction to Sacred Alignment',
            duration: '15:00',
            videoType: 'youtube',
            videoUrl: 'dQw4w9WgXcQ',
            isFreePreview: true,
            sortOrder: 1,
          },
        ],
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setSlug(c.slug);
    setSubtitle(c.subtitle || '');
    setDescription(c.description);
    setCategory(c.category);
    setLevel(c.level);
    setPrice(c.price);
    setOriginalPrice(c.originalPrice || 0);
    setThumbnail(c.thumbnail);
    setTrailerUrl(c.trailerVideoUrl || '');
    setInstructorName(c.instructor.name);
    setInstructorTitle(c.instructor.title);
    setWhatYouLearnText((c.whatYouWillLearn || []).join('\n'));
    setModules(c.modules && c.modules.length > 0 ? c.modules : []);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCourse) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80)
      );
    }
  };

  // Module & Lesson helpers
  const addModule = () => {
    const modId = `mod-${Date.now()}-${modules.length + 1}`;
    setModules([
      ...modules,
      {
        id: modId,
        courseId: editingCourse?.id || '',
        title: `Section ${modules.length + 1}: New Module`,
        sortOrder: modules.length + 1,
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            moduleId: modId,
            courseId: editingCourse?.id || '',
            title: 'Lesson 1: New Lesson',
            duration: '12:00',
            videoType: 'youtube',
            videoUrl: 'dQw4w9WgXcQ',
            isFreePreview: false,
            sortOrder: 1,
          },
        ],
      },
    ]);
  };

  const removeModule = (modIdx: number) => {
    setModules(modules.filter((_, idx) => idx !== modIdx));
  };

  const addLessonToModule = (modIdx: number) => {
    const updated = [...modules];
    const mod = updated[modIdx];
    const newLessonId = `les-${Date.now()}-${mod.lessons.length + 1}`;
    mod.lessons.push({
      id: newLessonId,
      moduleId: mod.id,
      courseId: editingCourse?.id || '',
      title: `Lesson ${mod.lessons.length + 1}: New Topic`,
      duration: '15:00',
      videoType: 'youtube',
      videoUrl: 'dQw4w9WgXcQ',
      isFreePreview: false,
      sortOrder: mod.lessons.length + 1,
    });
    setModules(updated);
  };

  const removeLesson = (modIdx: number, lesIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, idx) => idx !== lesIdx);
    setModules(updated);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const learnItems = whatYouLearnText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

    const payload = {
      id: editingCourse?.id || `course-${Date.now()}`,
      slug,
      title,
      subtitle,
      description,
      category,
      level,
      price: Number(price),
      originalPrice: Number(originalPrice),
      thumbnail,
      trailerVideoUrl: trailerUrl,
      instructor: {
        name: instructorName,
        title: instructorTitle,
      },
      whatYouWillLearn: learnItems,
      totalLessons,
      totalDuration: `${Math.round(totalLessons * 18 / 60)} Hours`,
      modules,
      status: 'published',
      rating: editingCourse?.rating || 5.0,
      reviewsCount: editingCourse?.reviewsCount || 0,
      certificateEnabled: true,
    };

    try {
      const res = await adminFetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save course');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving course' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      }
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
              Video LMS Platform
            </span>
            <span className="text-xs text-slate-500 font-mono">PW / Udemy Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Courses &amp; Video Teachings (कोर्सेस एवं प्रवचन)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Manage structured masterclass curriculum, video lecture streams, anti-piracy forensic watermarking, and student enrollments.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#1346af] hover:bg-[#0008c1] text-white text-xs sm:text-sm font-bold shadow-lg transition"
        >
          <Plus size={18} />
          <span>Create New Course (नया कोर्स बनाएं)</span>
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <GraduationCap size={44} className="text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Courses Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Create New Course&quot; to set up your first sacred video teachings masterclass.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(courses) ? courses : []).map((c) => {
            const modulesList = Array.isArray(c.modules) ? c.modules : [];
            const lessonsCount =
              c.totalLessons || modulesList.reduce((acc, m) => acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-900 w-full">
                  <Image src={c.thumbnail} alt={c.title} fill className="object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/95 text-slate-900 shadow">
                      {c.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-[10px] text-white font-medium">
                    <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      {lessonsCount} Lessons
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      {c.totalDuration}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-slate-900 line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.subtitle || c.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {c.price === 0 ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          FREE
                        </span>
                      ) : (
                        <span className="text-base font-bold text-slate-900">
                          ₹{c.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/courses/${c.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-[#1346af] rounded-lg hover:bg-slate-50 transition"
                        title="View Public Page"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition"
                        title="Edit Course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {editingCourse ? 'Edit Video Course' : 'Create New Masterclass Course'}
                </h3>
                <p className="text-xs text-slate-500">
                  Setup modules, lessons, video URLs, and student requirements.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {msg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Brahma Muhurta Manifestation Mastery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="brahma-muhurta-manifestation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  >
                    <option value="Manifestation & Sacred Energy">Manifestation &amp; Sacred Energy</option>
                    <option value="Vastu Shastra & Space Healing">Vastu Shastra &amp; Space Healing</option>
                    <option value="Spiritual Wisdom">Spiritual Wisdom</option>
                    <option value="Mantra & Dhyan Science">Mantra &amp; Dhyan Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price in INR (0 for Free Course)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trailer Video URL or YouTube ID
                  </label>
                  <input
                    type="text"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    placeholder="dQw4w9WgXcQ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Short engaging subtitle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What You Will Learn (1 point per line)
                </label>
                <textarea
                  rows={3}
                  value={whatYouLearnText}
                  onChange={(e) => setWhatYouLearnText(e.target.value)}
                  placeholder="Point 1&#10;Point 2&#10;Point 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#1346af]"
                />
              </div>

              {/* MODULES & LESSONS BUILDER */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center space-x-2">
                    <BookOpen size={18} className="text-[#1346af]" />
                    <span>Curriculum (Modules &amp; Lessons)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addModule}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1346af] hover:bg-blue-100 text-xs font-bold transition"
                  >
                    <Plus size={15} />
                    <span>Add Section</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {modules.map((mod, mIdx) => (
                    <div
                      key={mod.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[mIdx].title = e.target.value;
                            setModules(updated);
                          }}
                          placeholder="Module / Section Title"
                          className="font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-300 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeModule(mIdx)}
                          className="text-red-500 hover:text-red-700 text-xs p-1"
                          title="Remove Section"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Lessons in this module */}
                      <div className="space-y-2 pl-2">
                        {mod.lessons.map((les, lIdx) => (
                          <div
                            key={les.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                          >
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].title = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="Lesson title"
                              className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={les.duration}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].duration = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="15:00"
                              className="w-20 px-2 py-1.5 rounded border border-slate-200 text-xs font-mono text-center"
                            />
                            <input
                              type="text"
                              value={les.videoUrl}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].videoUrl = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="YouTube ID or video URL"
                              className="w-44 px-2 py-1.5 rounded border border-slate-200 text-xs font-mono"
                            />
                            <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={Boolean(les.isFreePreview)}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[mIdx].lessons[lIdx].isFreePreview = e.target.checked;
                                  setModules(updated);
                                }}
                              />
                              <span>Free Preview</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeLesson(mIdx, lIdx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addLessonToModule(mIdx)}
                          className="text-xs text-[#1346af] font-semibold hover:underline flex items-center space-x-1 pt-1"
                        >
                          <PlusCircle size={14} />
                          <span>Add Lesson to this Section</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#1346af] hover:bg-[#0008c1] disabled:bg-slate-400 text-white text-xs font-bold shadow-lg transition"
                >
                  {saving ? 'Saving Course...' : editingCourse ? 'Update Course' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
