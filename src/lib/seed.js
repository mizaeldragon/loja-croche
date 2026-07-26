// Dados iniciais (seed) do ateliê — usados para popular o localStorage na primeira execução.
// Imagens locais de crochê em /public/images, alinhadas a cada título.

const local = (path) => `/images/${path}`

const ph = (w, h, bg, fg, text) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?font=playfair-display&text=${encodeURIComponent(text)}`

export const PALETTE_BG = ['FDD7CA', 'CCAFA1', 'F5C4B4', 'FFF7F3', 'EAD9D0']
export const PALETTE_FG = ['1F2937', '111827', '4B5563']

export const seedCategories = [
  {
    id: 'cat_roupas',
    name: 'Roupas',
    slug: 'roupas',
    description: 'Blusas, tops, vestidos e cardigans em crochê fino, feitos sob medida.',
    image: local('categorias/roupas.jpg'),
    order: 1,
  },
  {
    id: 'cat_acessorios',
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Bolsas, chapéus, bandanas e cintos que finalizam qualquer look.',
    image: local('categorias/acessorios.jpg'),
    order: 2,
  },
  {
    id: 'cat_decoracao',
    name: 'Decoração',
    slug: 'decoracao',
    description: 'Almofadas, mandalas e peças que aquecem qualquer ambiente.',
    image: local('categorias/decoracao.jpg'),
    order: 3,
  },
  {
    id: 'cat_enxovais',
    name: 'Enxovais',
    slug: 'enxovais',
    description: 'Mantas e conjuntos delicados para a chegada do bebê.',
    image: local('categorias/enxovais.jpg'),
    order: 4,
  },
  {
    id: 'cat_personalizados',
    name: 'Personalizados',
    slug: 'personalizados',
    description: 'Peças exclusivas, criadas a partir da sua ideia e medidas.',
    image: local('categorias/personalizados.jpg'),
    order: 5,
  },
  {
    id: 'cat_presentes',
    name: 'Presentes',
    slug: 'presentes',
    description: 'Kits e miniaturas perfeitas para presentear com afeto.',
    image: local('categorias/presentes.jpg'),
    order: 6,
  },
]

let _seq = 1
function prod({
  name,
  category,
  price,
  promoPrice = null,
  description,
  colors = [],
  sizes = [],
  stock = 12,
  featured = false,
  bestseller = false,
  isNew = false,
  tags = [],
  images = [],
}) {
  const id = `prod_${_seq}`
  _seq += 1
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return {
    id,
    name,
    slug,
    category,
    price,
    promoPrice,
    description,
    shortDescription: description.slice(0, 90) + (description.length > 90 ? '…' : ''),
    colors,
    sizes,
    stock,
    status: 'published',
    featured,
    bestseller,
    isNew,
    tags,
    images,
    seoTitle: `${name} | Ateliê Angel Art Crochê`,
    seoDescription: description.slice(0, 150),
    order: _seq,
    createdAt: new Date(Date.now() - _seq * 86400000).toISOString(),
  }
}

export const seedProducts = [
  prod({
    name: 'Porta xicara maça',
    category: 'decoracao',
    price: 20.0,
    description:
      'Porta-xícara em crochê de fio de malha no formato de maçã, com cabinho e folhinha. Peça artesanal perfeita para mesa posta ou presente.',
    colors: ['Vermelho'],
    sizes: ['Único'],
    featured: true,
    isNew: true,
    tags: ['mesa', 'crochê', 'fio de malha'],
    images: [local('produtos/porta-xicara-maca.png')],
  }),
  prod({
    name: 'ChaveiroDivino',
    category: 'presentes',
    price: 13.0,
    description:
      'Chaveiro em crochê de fio de malha com divino espírito santo e medalha personalizada. Ideal para lembrancinha de batizado.',
    colors: ['Areia', 'Verde'],
    sizes: ['Único'],
    bestseller: true,
    tags: ['batizado', 'lembrança', 'personalizado'],
    images: [local('produtos/chaveiro-divino.png')],
  }),
  prod({
    name: 'Porta joía tulipa',
    category: 'decoracao',
    price: 28.0,
    description:
      'Porta-joia em crochê de fio de malha com detalhes em formato de tulipas. Delicado e funcional para organizar acessórios.',
    colors: ['Rosa', 'Lilás'],
    sizes: ['Único'],
    featured: true,
    tags: ['organização', 'tulipa', 'presente'],
    images: [local('produtos/porta-joia-tulipa.png')],
  }),
  prod({
    name: 'Kit higiene bebê 5 peças',
    category: 'enxovais',
    price: 360.0,
    description:
      'Kit higiene completo com 5 peças em crochê de fio de malha, com aplicações de bichinhos. Perfeito para o quartinho do bebê.',
    colors: ['Verde água', 'Bege', 'Branco'],
    sizes: ['Kit'],
    featured: true,
    bestseller: true,
    tags: ['bebê', 'kit', 'higiene'],
    images: [local('produtos/kit-higiene-bebe-5.png')],
  }),
  prod({
    name: 'Mini Porta Panetone',
    category: 'decoracao',
    price: 37.0,
    description:
      'Mini porta-panetone em crochê de fio de malha com tema natalino. Ideal para mesa de festa ou presente de fim de ano.',
    colors: ['Verde', 'Vermelho', 'Branco'],
    sizes: ['Único'],
    isNew: true,
    tags: ['natal', 'festa', 'panetone'],
    images: [local('produtos/mini-porta-panetone.png')],
  }),
  prod({
    name: 'tulipas para difusores',
    category: 'decoracao',
    price: 18.0,
    description:
      'Tulipa em crochê de fio de malha para difusor de ambientes. Disponível em várias cores para combinar com a sua decoração.',
    colors: ['Variadas'],
    sizes: ['Único'],
    tags: ['difusor', 'tulipa', 'aroma'],
    images: [local('produtos/tulipas-difusores.png')],
  }),
  prod({
    name: 'Kit higiene bebê 3 peças',
    category: 'enxovais',
    price: 200.0,
    description:
      'Kit higiene com 3 peças em crochê de fio de malha nas cores sage, bege e branco. Prático e charmoso para o bebê.',
    colors: ['Sage', 'Bege', 'Branco'],
    sizes: ['Kit'],
    featured: true,
    tags: ['bebê', 'kit', 'higiene'],
    images: [local('produtos/kit-higiene-bebe-3.png')],
  }),
  prod({
    name: 'Guirlanda Decorativa',
    category: 'decoracao',
    price: 90.0,
    description:
      'Guirlanda decorativa em crochê de fio de malha com centro em MDF recortado em corações. Linda para porta ou parede.',
    colors: ['Rosa', 'Branco'],
    sizes: ['Único'],
    featured: true,
    tags: ['guirlanda', 'decoração', 'casa'],
    images: [local('produtos/guirlanda-decorativa.png')],
  }),
  prod({
    name: 'Sacola Presente M',
    category: 'presentes',
    price: 64.0,
    description:
      'Conjunto presente tamanho M com cesto florido em crochê e chaveiro de flor, acompanhado de tag especial. Pronto para presentear.',
    colors: ['Vermelho', 'Bege'],
    sizes: ['M'],
    bestseller: true,
    isNew: true,
    tags: ['presente', 'mãe', 'kit'],
    images: [local('produtos/sacola-presente-m.png')],
  }),
  prod({
    name: 'mandalaP',
    category: 'presentes',
    price: 19.0,
    description:
      'Mandala/chaveiro em crochê de fio de malha com divino espírito santo, medalha e cartão personalizado para batizado.',
    colors: ['Verde sage'],
    sizes: ['Único'],
    tags: ['batizado', 'lembrança', 'mandala'],
    images: [local('produtos/mandala-p.png')],
  }),
]

export const seedTestimonials = [
  {
    id: 't1',
    name: 'Marina Salles',
    role: 'Cliente • São Paulo, SP',
    text: 'A blusa que comprei é ainda mais linda pessoalmente. Dá para sentir o cuidado em cada ponto. Já é minha peça favorita do guarda-roupa.',
    rating: 5,
    avatar: ph(200, 200, 'CCAFA1', '1F2937', 'MS'),
    featured: true,
  },
  {
    id: 't2',
    name: 'Camila Duarte',
    role: 'Cliente • Belo Horizonte, MG',
    text: 'Encomendei a manta de bebê personalizada e recebi antes do prazo, com uma embalagem impecável. Qualidade de dar inveja.',
    rating: 5,
    avatar: ph(200, 200, 'FDD7CA', '1F2937', 'CD'),
    featured: true,
  },
  {
    id: 't3',
    name: 'Fernanda Rocha',
    role: 'Cliente • Curitiba, PR',
    text: 'Atendimento maravilhoso do início ao fim. A bolsa é resistente, linda e recebo elogios toda vez que uso.',
    rating: 5,
    avatar: ph(200, 200, 'EAD9D0', '111827', 'FR'),
    featured: true,
  },
  {
    id: 't4',
    name: 'Juliana Prado',
    role: 'Cliente • Rio de Janeiro, RJ',
    text: 'Comprei o cardigan para o inverno e é simplesmente perfeito — quentinho, elegante e muito bem feito.',
    rating: 5,
    avatar: ph(200, 200, 'FFF7F3', '1F2937', 'JP'),
    featured: false,
  },
  {
    id: 't5',
    name: 'Beatriz Lima',
    role: 'Cliente • Porto Alegre, RS',
    text: 'Já é a terceira peça que compro. A qualidade é sempre impecável e o acabamento surpreende a cada detalhe.',
    rating: 5,
    avatar: ph(200, 200, 'F5C4B4', '4B5563', 'BL'),
    featured: false,
  },
  {
    id: 't6',
    name: 'Helena Castro',
    role: 'Cliente • Florianópolis, SC',
    text: 'O vestido sob medida ficou exatamente como eu sonhei. Fios lindos, caimento perfeito e um carinho no atendimento que faz toda a diferença.',
    rating: 5,
    avatar: ph(200, 200, 'CCAFA1', '1F2937', 'HC'),
    featured: true,
  },
]

export const seedFaqs = [
  {
    id: 'f1',
    question: 'Quanto tempo leva para produzir uma peça personalizada?',
    answer:
      'O prazo médio é de 7 a 15 dias úteis, dependendo da complexidade da peça. Encomendas com prazos especiais podem ser combinadas diretamente conosco.',
  },
  {
    id: 'f2',
    question: 'Como funciona a personalização de cores e tamanhos?',
    answer:
      'Após a escolha do modelo, você define cor, tamanho e pequenos ajustes através do nosso atendimento. Cada peça é feita sob medida com muito cuidado.',
  },
  {
    id: 'f3',
    question: 'Vocês enviam para todo o Brasil?',
    answer:
      'Sim! Enviamos para todo o território nacional com embalagem protegida e cuidadosa, para que sua peça chegue em perfeito estado.',
  },
  {
    id: 'f4',
    question: 'Qual o cuidado necessário com as peças de crochê?',
    answer:
      'Recomendamos lavagem à mão com sabão neutro e secagem à sombra, na horizontal, para preservar o formato e a textura da peça.',
  },
  {
    id: 'f5',
    question: 'Posso solicitar um orçamento sem compromisso?',
    answer:
      'Claro! Basta preencher o formulário de contato ou nos chamar no WhatsApp contando sua ideia, que retornamos com todos os detalhes.',
  },
  {
    id: 'f6',
    question: 'As peças têm garantia de qualidade?',
    answer:
      'Sim, todas as peças passam por rigorosa conferência de acabamento antes do envio, garantindo qualidade e durabilidade.',
  },
]

export const seedBanners = {
  hero: {
    eyebrow: 'Feito à mão, ponto a ponto',
    title: 'Crochê autoral que veste histórias e aquece momentos',
    subtitle:
      'Peças exclusivas, personalizadas e produzidas artesanalmente com fios selecionados — para quem valoriza exclusividade, delicadeza e qualidade em cada detalhe.',
    primaryCta: 'Ver coleção',
    primaryCtaLink: '/loja',
    secondaryCta: 'Solicitar orçamento',
    secondaryCtaLink: '#contato',
    image: local('banners/hero.png') + '?v=9',
  },
  carousel: [
    {
      id: 'carousel_1',
      title: 'Roupas em crochê autoral',
      subtitle: 'Blusas e cardigans feitos fio a fio para vestir com exclusividade.',
      image: local('banners/carousel-1.jpg'),
      ctaLabel: 'Ver roupas',
      ctaLink: '/loja?categoria=roupas',
    },
    {
      id: 'carousel_2',
      title: 'Acessórios que finalizam o look',
      subtitle: 'Bolsas, chapéus e peças tramadas à mão para o dia a dia.',
      image: local('banners/carousel-2.jpg'),
      ctaLabel: 'Ver acessórios',
      ctaLink: '/loja?categoria=acessorios',
    },
    {
      id: 'carousel_3',
      title: 'Aconchego para a casa',
      subtitle: 'Mantas, almofadas e detalhes que aquecem cada ambiente.',
      image: local('banners/carousel-3.jpg'),
      ctaLabel: 'Ver decoração',
      ctaLink: '/loja?categoria=decoracao',
    },
    {
      id: 'carousel_4',
      title: 'Presentes e enxovais delicados',
      subtitle: 'Peças especiais para celebrar momentos que importam.',
      image: local('banners/carousel-4.jpg'),
      ctaLabel: 'Ver coleção',
      ctaLink: '/loja',
    },
  ],
  promo: {
    title: 'Peças sob encomenda para ocasiões especiais',
    subtitle: 'Do casamento ao chá de bebê, criamos peças únicas para o seu momento.',
    image: local('banners/promo.jpg'),
    ctaLabel: 'Fale conosco',
    ctaLink: '#contato',
  },
}

export const seedSettings = {
  siteName: 'Angel Art',
  tagline: 'Ateliê de Crochê',
  aboutTitle: 'Cada peça carrega uma história tecida à mão',
  aboutText:
    'Nascemos da paixão por transformar fios em peças que contam histórias. No Ateliê Angel Art Crochê, cada item é confeccionado manualmente, com atenção total aos detalhes, respeitando o tempo natural do artesanato. Não trabalhamos com produção em série: cada peça é única, exclusiva e carrega a marca de quem a fez — por isso, valorizamos o tempo, o material selecionado e a técnica refinada em cada ponto.',
  aboutImage: local('sobre-atelie.jpg'),
  aboutHighlights: [
    { label: 'Peças produzidas', value: '2.400+' },
    { label: 'Clientes satisfeitas', value: '1.100+' },
    { label: 'Anos de ofício', value: '12' },
  ],
  email: 'contato@linhaeponto.com.br',
  phone: '(11) 98888-4455',
  whatsapp: '5511988884455',
  instagram: '@linhaeponto.atelie',
  facebook: 'linhaepontoatelie',
  address: 'São Paulo, SP — Atendimento sob agendamento',
  footerText:
    'Peças artesanais em crochê, feitas à mão com fios selecionados. Exclusividade e delicadeza em cada detalhe.',
  ctaTitle: 'Pronta para vestir uma peça feita especialmente para você?',
  ctaSubtitle: 'Fale com nosso ateliê e monte sua peça personalizada ou tire dúvidas sobre nossa coleção.',
  benefits: [
    { title: '100% Artesanal', desc: 'Cada peça é feita à mão, fio a fio, sem produção em série.' },
    { title: 'Personalização Total', desc: 'Cores, tamanhos e detalhes sob medida para você.' },
    { title: 'Envio Cuidadoso', desc: 'Embalagem protegida com identidade visual exclusiva.' },
    { title: 'Peças Exclusivas', desc: 'Edições limitadas que valorizam sua individualidade.' },
    { title: 'Acabamento Premium', desc: 'Fios selecionados e conferência rigorosa de qualidade.' },
    { title: 'Atendimento Próximo', desc: 'Suporte humano do primeiro contato até a entrega.' },
  ],
}

export const seedOrders = [
  {
    id: 'ord_1',
    customerName: 'Patrícia Nogueira',
    contact: '(11) 97777-2233',
    email: 'patricia.n@email.com',
    items: 'Porta joía tulipa (Rosa)',
    total: 28.0,
    status: 'novo',
    type: 'pedido',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord_2',
    customerName: 'Renata Costa',
    contact: '(21) 96666-1122',
    email: 'renata.costa@email.com',
    items: 'Orçamento: Kit higiene bebê 5 peças personalizado',
    total: null,
    status: 'em_andamento',
    type: 'orcamento',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ord_3',
    customerName: 'Ana Beatriz Souza',
    contact: '(31) 95555-9988',
    email: 'ana.beatriz@email.com',
    items: 'Kit higiene bebê 3 peças + ChaveiroDivino',
    total: 213.0,
    status: 'concluido',
    type: 'pedido',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'ord_4',
    customerName: 'Larissa Martins',
    contact: '(41) 94444-7766',
    email: 'larissa.m@email.com',
    items: 'Sacola Presente M',
    total: 64.0,
    status: 'cancelado',
    type: 'pedido',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
]

export const seedUsers = [
  {
    id: 'user_admin',
    name: 'Administradora do Ateliê',
    email: 'admin@linhaeponto.com',
    password: 'crochedelicado',
    role: 'admin',
    status: 'ativo',
    avatar: ph(200, 200, 'EAD9D0', '111827', 'AT'),
  },
  {
    id: 'user_editor',
    name: 'Equipe de Conteúdo',
    email: 'editor@linhaeponto.com',
    password: 'editor123',
    role: 'editor',
    status: 'ativo',
    avatar: ph(200, 200, 'FDD7CA', '1F2937', 'EC'),
  },
]
