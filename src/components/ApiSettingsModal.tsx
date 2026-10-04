/**
 * @file ApiSettingsModal.tsx
 * @description Modal interativo para o desenvolvedor testar URLs reais de produção,
 * inspecionar a estrutura JSON esperada e alternar cenários de apuração.
 */

import React, { useState } from 'react';
import { X, Globe, Terminal, Play, RotateCcw, Check, Copy } from 'lucide-react';
import { DEFAULT_API_URL } from '../services/electionApi';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  isRealApiMode: boolean;
  onSaveUrl: (url: string, isReal: boolean) => void;
  onSimulatePercent: (pct: number) => void;
  onResetSimulation: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  isRealApiMode,
  onSaveUrl,
  onSimulatePercent,
  onResetSimulation,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [useReal, setUseReal] = useState(isRealApiMode);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exampleJson = `{
  "total_urnas_apuradas": 85.50,
  "secoes_total": 472075,
  "secoes_apuradas": 403624,
  "votos_validos": 98500200,
  "votos_brancos": 2400100,
  "votos_nulos": 2800300,
  "candidatos": [
    {
      "id": "cand-1",
      "nome": "Candidato A",
      "partido": "Partido X",
      "siglaPartido": "PX",
      "numero": 10,
      "votos": 47280100,
      "porcentagem": 48.00
    },
    {
      "id": "cand-2",
      "nome": "Candidato B",
      "partido": "Partido Y",
      "siglaPartido": "PY",
      "numero": 20,
      "votos": 42355000,
      "porcentagem": 43.00
    }
  ]
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(inputUrl, useReal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        
        {/* Header do modal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuração da API de Apuração
              </h2>
              <p className="text-xs text-slate-500">
                Substitua o mock pela sua URL de produção ou teste cenários
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do modal */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          
          {/* Seletor de Modo / Formulário de URL */}
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Endpoint da API REST
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://sua-api.com/v1/apuracao"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors shrink-0"
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* Checkbox modo real vs mock */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useReal}
                  onChange={(e) => setUseReal(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-slate-900">
                    Habilitar chamadas fetch() reais para a URL informada
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Se desmarcado, a aplicação utiliza a camada de simulação realista com incremento automático. Certifique-se de que a API remota suporte CORS.
                  </p>
                </div>
              </label>
              <button
                type="button"
                onClick={() => {
                  setInputUrl(DEFAULT_API_URL);
                  setUseReal(false);
                }}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                Restaurar URL padrão do mock
              </button>
            </div>
          </form>

          {/* Teste Rápido de Cenários Eleitorais */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 text-blue-600" />
              Simular Estágios da Apuração
            </h3>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Simule a evolução instantânea da apuração eleitoral:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSimulatePercent(18.5);
                  onClose();
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-bold text-slate-900">18.5%</div>
                <div className="text-[10px] text-slate-500">Início da apuração</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSimulatePercent(55.2);
                  onClose();
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-bold text-slate-900">55.2%</div>
                <div className="text-[10px] text-slate-500">Metade apurada</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSimulatePercent(88.4);
                  onClose();
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-bold text-slate-900">88.4%</div>
                <div className="text-[10px] text-slate-500">Reta final</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSimulatePercent(100.0);
                  onClose();
                }}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left hover:bg-emerald-100 transition-colors"
              >
                <div className="font-bold text-emerald-800">100.0%</div>
                <div className="text-[10px] text-emerald-600">Totalização Final</div>
              </button>
            </div>

            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onResetSimulation();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3" />
                Reiniciar simulação (voltar para 65%)
              </button>
            </div>
          </div>

          {/* Formato JSON esperado */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-600" />
                Estrutura JSON Esperada pela API
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copiado!' : 'Copiar exemplo'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48 border border-slate-800">
              {exampleJson}
            </pre>
          </div>

        </div>

        {/* Rodapé do modal */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
