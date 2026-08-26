import React from 'react';
import { Subject, IntegrationMode, DisabilityType, AIFrameworkVersion } from '../types';
import { Bot, Cpu, Sparkles, HeartHandshake, BookOpen, GraduationCap, CheckCircle, Info } from 'lucide-react';

interface LessonFormProps {
  subject: Subject;
  setSubject: (val: Subject) => void;
  grade: number;
  setGrade: (val: number) => void;
  includeNLSAndAI: boolean;
  setIncludeNLSAndAI: (val: boolean) => void;
  integrationMode: IntegrationMode;
  setIntegrationMode: (val: IntegrationMode) => void;
  aiFrameworkVersion: AIFrameworkVersion;
  setAiFrameworkVersion: (val: AIFrameworkVersion) => void;
  includeDisabilitySupport: boolean;
  setIncludeDisabilitySupport: (val: boolean) => void;
  disabilityType: DisabilityType;
  setDisabilityType: (val: DisabilityType) => void;
  includeEnglishIntegration: boolean;
  setIncludeEnglishIntegration: (val: boolean) => void;
  englishIntegrationLevel: import('../types').EnglishIntegrationLevel;
  setEnglishIntegrationLevel: (val: import('../types').EnglishIntegrationLevel) => void;
  // Chế độ bổ sung: phát hiện tự động + cho phép bật/tắt thủ công
  hasExistingNLS: boolean;       // Kết quả tự động phát hiện từ ContentInput
  isSupplementMode: boolean;     // Trạng thái người dùng bật/tắt thủ công
  setIsSupplementMode: (val: boolean) => void;
  autoDetectedMsg?: string | null; // Thông báo tự nhận diện môn & lớp
  // Tích hợp STEM vào Hoạt động Vận dụng
  enableStem: boolean;
  setEnableStem: (val: boolean) => void;
}

const LessonForm: React.FC<LessonFormProps> = ({
  subject,
  setSubject,
  grade,
  setGrade,
  includeNLSAndAI,
  setIncludeNLSAndAI,
  integrationMode,
  setIntegrationMode,
  aiFrameworkVersion,
  setAiFrameworkVersion,
  includeDisabilitySupport,
  setIncludeDisabilitySupport,
  disabilityType,
  setDisabilityType,
  includeEnglishIntegration,
  setIncludeEnglishIntegration,
  englishIntegrationLevel,
  setEnglishIntegrationLevel,
  hasExistingNLS,
  isSupplementMode,
  setIsSupplementMode,
  autoDetectedMsg,
  enableStem,
  setEnableStem,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xl shadow-indigo-900/5 border border-indigo-100/80 mb-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Thông tin Kế hoạch bài dạy
          </h2>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200/60">
          Bước 1 / 2
        </span>
      </div>

      {/* Vùng chọn Môn học & Khối lớp — Nổi bật & Tự động nhận diện */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50/80 border-2 border-indigo-200/90 shadow-sm space-y-3.5">
        {/* Banner thông báo tự động nhận diện nếu có */}
        {autoDetectedMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold animate-pulse">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{autoDetectedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Subject */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                <BookOpen size={15} className="text-indigo-600" />
                <span>Môn học</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100/90 text-indigo-800 border border-indigo-200/60">
                BẮT BUỘC
              </span>
            </div>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="block w-full rounded-xl border-2 border-indigo-200 bg-white p-3 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all cursor-pointer shadow-sm"
              >
                {Object.values(Subject).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                <GraduationCap size={16} className="text-indigo-600" />
                <span>Khối lớp</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100/90 text-indigo-800 border border-indigo-200/60">
                BẮT BUỘC
              </span>
            </div>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="block w-full rounded-xl border-2 border-indigo-200 bg-white p-3 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all cursor-pointer shadow-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>Lớp {g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hướng dẫn lưu ý */}
        <div className="flex items-start gap-1.5 pt-1 text-[11px] sm:text-xs text-indigo-900/80 font-medium">
          <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Lưu ý quan trọng:</strong> Môn học và Khối lớp giúp AI định hướng đúng công cụ giảng dạy (GeoGebra, PhET...) và phân cấp mã Năng lực số / AI chính xác theo độ tuổi học sinh.
          </span>
        </div>
      </div>


      {/* Integration Mode Selector */}
      <div className="space-y-3.5 text-left pt-5 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={includeNLSAndAI}
            onChange={(e) => setIncludeNLSAndAI(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 focus:ring-offset-0 transition-transform group-hover:scale-105"
          />
          <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center group-hover:text-blue-600 transition-colors">
            <Bot className="text-blue-600 mr-2" size={20} />
            Tích hợp Năng lực số & Năng lực AI <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">TT 02/2025 & QĐ 3439</span>
          </span>
        </label>

        {includeNLSAndAI && (
          <div className="p-4 bg-slate-50/90 border border-indigo-100 rounded-2xl space-y-3.5 animate-fadeIn shadow-inner">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Chọn chế độ tích hợp chi tiết:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setIntegrationMode('BOTH')}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                  integrationMode === 'BOTH'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 shadow-sm'
                }`}
              >
                <Sparkles size={17} />
                <span>Tích hợp NLS & AI (Khuyên dùng)</span>
              </button>

              <button
                type="button"
                onClick={() => setIntegrationMode('NLS')}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                  integrationMode === 'NLS'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 shadow-sm'
                }`}
              >
                <Cpu size={17} />
                <span>Chỉ Năng lực số</span>
              </button>

              <button
                type="button"
                onClick={() => setIntegrationMode('AI')}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                  integrationMode === 'AI'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-purple-500/25 ring-2 ring-purple-400/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 shadow-sm'
                }`}
              >
                <Bot size={17} />
                <span>Chỉ Năng lực AI</span>
              </button>
            </div>

            {/* Chọn phiên bản Khung Năng lực AI — chỉ hiện khi AI được bật */}
            {(integrationMode === 'AI' || integrationMode === 'BOTH') && (
              <div className="flex items-center gap-3 px-1 py-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Khung AI:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="aiFramework"
                    value="QD2422"
                    checked={aiFrameworkVersion === 'QD2422'}
                    onChange={() => setAiFrameworkVersion('QD2422')}
                    className="w-3.5 h-3.5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className={`text-xs font-bold ${aiFrameworkVersion === 'QD2422' ? 'text-purple-700' : 'text-slate-500'}`}>
                    QĐ 2422 <span className="font-normal text-[10px]">(chính thức 2026–2027)</span>
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="aiFramework"
                    value="QD3439"
                    checked={aiFrameworkVersion === 'QD3439'}
                    onChange={() => setAiFrameworkVersion('QD3439')}
                    className="w-3.5 h-3.5 text-slate-400 focus:ring-slate-400"
                  />
                  <span className={`text-xs font-bold ${aiFrameworkVersion === 'QD3439' ? 'text-slate-700' : 'text-slate-400'}`}>
                    QĐ 3439 <span className="font-normal text-[10px]">(thí điểm)</span>
                  </span>
                </label>
              </div>
            )}

            {/* Nút thủ công & Tự động: Chế độ Bổ sung (File đã có NLS sẵn) - LUÔN LUÔN HIỂN THỊ */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              isSupplementMode 
                ? 'bg-blue-50/95 border-blue-300 ring-2 ring-blue-400/20 shadow-sm' 
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}>
              <label className="flex items-start space-x-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={isSupplementMode}
                  onChange={(e) => setIsSupplementMode(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 focus:ring-offset-0 transition-transform group-hover:scale-105 mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>🔄</span>
                      Bài soạn ĐÃ CÓ sẵn NLS (Chế độ Bổ sung thêm AI / HSKT / Tiếng Anh)
                    </span>
                    {hasExistingNLS && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                        ⚡ Đã tự phát hiện NLS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {isSupplementMode ? (
                      <span className="text-blue-800 font-medium">
                        ✔ <strong>Đang kích hoạt Chế độ Bổ sung:</strong> Giữ nguyên 100% NLS cũ trong bài soạn gốc, AI chỉ chèn thêm các năng lực được chọn (Năng lực AI, HSKT, Tiếng Anh) vào đúng các bước mà không tái tạo lại NLS.
                      </span>
                    ) : (
                      <span>
                        Tích chọn mục này nếu bài soạn của bạn đã có NLS từ trước và bạn chỉ muốn bổ sung thêm AI, HSKT, hoặc Tiếng Anh vào đúng vị trí.
                      </span>
                    )}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Inclusive Education Section */}
      <div className="space-y-3.5 text-left pt-5 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={includeDisabilitySupport}
            onChange={(e) => setIncludeDisabilitySupport(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 transition-transform group-hover:scale-105"
          />
          <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center group-hover:text-emerald-700 transition-colors">
            <HeartHandshake className="text-emerald-600 mr-2" size={20} />
            Tích hợp Giáo dục Hòa nhập (Học sinh Khuyết tật) <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">TT 03/2018</span>
          </span>
        </label>

        {includeDisabilitySupport && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5 text-left animate-fadeIn shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950">
              Dạng khuyết tật / Đối tượng học sinh cần hỗ trợ:
            </label>
            <select
              value={disabilityType}
              onChange={(e) => setDisabilityType(e.target.value as DisabilityType)}
              className="block w-full rounded-xl border-emerald-300 bg-white p-3 text-xs sm:text-sm font-bold text-emerald-950 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer shadow-sm"
            >
              <option value="GENERAL">🤝 Hòa nhập tổng hợp (Tất cả học sinh khuyết tật)</option>
              <option value="INTELLECTUAL">🧠 Khuyết tật Trí tuệ / Khó khăn học tập</option>
              <option value="VISUAL">👁️ Khuyết tật Thị giác (Nhìn)</option>
              <option value="HEARING">👂 Khuyết tật Thính giác (Nghe/Nói)</option>
              <option value="MOTOR">🦽 Khuyết tật Vận động</option>
            </select>
          </div>
        )}
      </div>

      {/* English Integration Section */}
      <div className="space-y-3.5 text-left pt-5 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={includeEnglishIntegration}
            onChange={(e) => setIncludeEnglishIntegration(e.target.checked)}
            className="w-5 h-5 text-amber-600 rounded-lg border-slate-300 focus:ring-amber-500 focus:ring-offset-0 transition-transform group-hover:scale-105"
          />
          <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center group-hover:text-amber-700 transition-colors">
            <span className="text-xl mr-2">🇬🇧</span>
            Tích hợp Tiếng Anh (Ngôn ngữ thứ 2) <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">QĐ 2371/2025</span>
          </span>
        </label>

        {includeEnglishIntegration && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5 text-left animate-fadeIn shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950">
              Mức độ tích hợp Tiếng Anh (CLIL):
            </label>
            <select
              value={englishIntegrationLevel}
              onChange={(e) => setEnglishIntegrationLevel(e.target.value as import('../types').EnglishIntegrationLevel)}
              className="block w-full rounded-xl border-amber-300 bg-white p-3 text-xs sm:text-sm font-bold text-amber-950 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 cursor-pointer shadow-sm"
            >
              <option value="BASIC">🔸 Cấp độ 1 (Cơ bản): Tích hợp từ vựng song ngữ (Key Vocabulary)</option>
              <option value="INTER">🔶 Cấp độ 2 (Trung cấp): Tích hợp Câu lệnh lớp học (Classroom Instructions)</option>
              <option value="CLIL">🌐 Cấp độ 3 (Nâng cao): Soạn bài theo chuẩn CLIL toàn diện</option>
            </select>
          </div>
        )}
      </div>

      {/* STEM Integration Section */}
      <div className="space-y-3.5 text-left pt-5 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={enableStem}
            onChange={(e) => setEnableStem(e.target.checked)}
            className="w-5 h-5 text-teal-600 rounded-lg border-slate-300 focus:ring-teal-500 focus:ring-offset-0 transition-transform group-hover:scale-105"
          />
          <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center group-hover:text-teal-700 transition-colors">
            <span className="text-xl mr-2">🔬</span>
            Tích hợp Giáo dục STEM{' '}
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Mô hình A — CV 5512
            </span>
          </span>
        </label>

        {enableStem && (
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2 text-left animate-fadeIn shadow-sm">
            <p className="text-xs font-bold text-teal-900">
              ✅ <strong>Đang BẬT Tích hợp STEM:</strong>
            </p>
            <p className="text-[11px] sm:text-xs text-teal-800 leading-relaxed">
              AI sẽ <strong>nâng cấp Hoạt động Vận dụng</strong> thành dự án STEM mini gắn thực tiễn:
              giao nhiệm vụ chế tạo/thiết kế/quan trắc thực tế, có sản phẩm cụ thể và rubric đánh giá 3 tiêu chí.
              Toàn bộ cấu trúc 4 hoạt động theo CV 5512 được giữ nguyên 100%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonForm;
